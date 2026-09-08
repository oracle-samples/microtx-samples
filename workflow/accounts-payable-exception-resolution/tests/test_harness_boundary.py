"""Static lint on the planner's authority boundary.

This is the test that turns the sample's central claim from a sentence in a
README into something a failing build enforces:

    The agent that investigates must not be the agent that pays.

It parses workflows/ap-exception-resolution-workflow.json, walks every task registered
under Investigate_AP_Exception.inputParameters.tasks, and fails if the planner
was ever handed anything other than a read-only GET against ap-backend's
/evidence API.

It is a test of CONFIGURATION, not of the model. It needs no running services,
no network, no API key and no dependencies beyond the standard library, so it
belongs in CI on every pull request.

Run it either way:

    pytest tests/test_harness_boundary.py
    python tests/test_harness_boundary.py
"""

import json
import os
import re
import unittest
from urllib.parse import urlparse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKFLOW_PATH = os.path.join(REPO_ROOT, "workflows", "ap-exception-resolution-workflow.json")

PLANNER_TASK_NAME = "Investigate_AP_Exception"
PLANNER_TASK_TYPE = "AGENTIC_PLANNER"

# The compact local runtime packages logical responsibilities in ap-backend.
# The planner may reach that host only through its read-only /evidence paths.
# Payment and settlement stay on separate hosts and neither can be a tool.
ALLOWED_HOST = "ap-backend"

FORBIDDEN_HOSTS = {"payment-service", "bank-mock"}

# Path segments that indicate an operation with side effects. Matched on whole
# segments, so "/purchase-orders/PO-7812" and "/invoices/duplicates" are fine.
WRITE_ISH_SEGMENTS = {
    "pay", "payment", "payments", "payment-instructions", "payment-scheduled",
    "settle", "settlement", "settlements", "reject", "approve", "approvals",
    "create", "update", "delete", "schedule", "scheduled", "instruction",
    "instructions", "prechecks", "policy", "evaluate", "verify",
    "internal", "rollback", "commit",
}

READ_ONLY_METHODS = {"GET"}


def load_workflow():
    with open(WORKFLOW_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def find_planner_task(workflow):
    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == PLANNER_TASK_TYPE or node.get("name") == PLANNER_TASK_NAME:
                return node
            for value in node.values():
                found = walk(value)
                if found:
                    return found
        elif isinstance(node, list):
            for value in node:
                found = walk(value)
                if found:
                    return found
        return None

    return walk(workflow.get("tasks", []))


def collect_http_requests(node, path="planner"):
    """Yield every (json_path, request dict) for HTTP tasks beneath a node.

    MicroTx workflow JSON places HTTP request fields directly under a task's
    inputParameters. The walk is recursive so a request hidden in a nested
    planner structure is still checked.
    """
    found = []
    if isinstance(node, dict):
        if node.get("type") == "HTTP" and isinstance(node.get("inputParameters"), dict):
            found.append((path, node["inputParameters"]))
        for key, value in node.items():
            if isinstance(value, (dict, list)):
                found.extend(collect_http_requests(value, f"{path}.{key}"))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            found.extend(collect_http_requests(value, f"{path}[{index}]"))
    return found


def segments_of(uri):
    """Path segments of a URI, with ${...} placeholders and query stripped."""
    path = urlparse(uri).path
    path = re.sub(r"\$\{[^}]*\}", "", path)
    return [seg.lower() for seg in path.split("/") if seg]


def hostname_of(uri):
    parsed = urlparse(uri)
    return (parsed.hostname or "").lower()


class PlannerBoundaryTest(unittest.TestCase):
    """Every failure message below names the offending task and what to do."""

    @classmethod
    def setUpClass(cls):
        cls.workflow = load_workflow()
        cls.planner = find_planner_task(cls.workflow)

    def test_planner_task_exists(self):
        self.assertIsNotNone(
            self.planner,
            f"No {PLANNER_TASK_TYPE} task found in {WORKFLOW_PATH}. This sample's "
            f"whole argument is about what the planner is allowed to call; if the "
            f"planner task is gone, the boundary test has nothing to check.")

    def test_planner_has_registered_tasks(self):
        tasks = self.planner.get("inputParameters", {}).get("tasks")
        self.assertIsInstance(
            tasks, list,
            f"{PLANNER_TASK_NAME}.inputParameters.tasks must be a list of task "
            f"definitions. The planner's authority is defined by this list and "
            f"nothing else.")
        self.assertGreater(
            len(tasks), 0,
            f"{PLANNER_TASK_NAME} registered zero tasks. A planner with no tools "
            f"cannot investigate anything.")

    def test_every_planner_task_is_a_get(self):
        for location, request in collect_http_requests(self.planner):
            method = str(request.get("method", "")).upper()
            uri = request.get("uri", "")
            self.assertTrue(
                method,
                f"BOUNDARY VIOLATION at {location}: the request to '{uri}' does not "
                f"state an HTTP method. Method must be explicit and must be GET, so "
                f"that reading this file is enough to see the planner cannot write.")
            self.assertIn(
                method, READ_ONLY_METHODS,
                f"BOUNDARY VIOLATION at {location}: the planner was registered a "
                f"{method} request to '{uri}'. The Agentic Planner may only be given "
                f"read-only operations. If this workflow genuinely needs to write, "
                f"the write belongs in a deterministic task after exception "
                f"resolution - "
                f"never inside the planner's task list.")

    def test_every_planner_task_targets_ap_backend_evidence_api(self):
        for location, request in collect_http_requests(self.planner):
            uri = request.get("uri", "")
            host = hostname_of(uri)
            self.assertTrue(
                host,
                f"BOUNDARY VIOLATION at {location}: could not parse a host out of "
                f"'{uri}'. Planner task URIs must be absolute so the target service "
                f"is auditable.")
            self.assertNotIn(
                host, FORBIDDEN_HOSTS,
                f"BOUNDARY VIOLATION at {location}: the planner was given access to "
                f"'{host}' via '{uri}'. The planner must only reach "
                f"'{ALLOWED_HOST}' through its read-only evidence API.")
            self.assertEqual(
                host, ALLOWED_HOST,
                f"BOUNDARY VIOLATION at {location}: the planner was given access to "
                f"'{host}' via '{uri}'. Only '{ALLOWED_HOST}' may be registered as a "
                f"planner tool. Evidence lookups live there precisely so this test "
                f"can be a single-host assertion.")

    def test_no_planner_task_targets_a_write_ish_path(self):
        for location, request in collect_http_requests(self.planner):
            uri = request.get("uri", "")
            offending = sorted(set(segments_of(uri)) & WRITE_ISH_SEGMENTS)
            self.assertFalse(
                offending,
                f"BOUNDARY VIOLATION at {location}: '{uri}' contains the path "
                f"segment(s) {offending}, which name operations with side effects. "
                f"Even if the method is GET, an endpoint under one of these paths "
                f"has no business in the planner's tool list. Rename the endpoint if "
                f"it is genuinely a read, or move it out of the planner.")

    def test_write_tasks_exist_outside_the_planner(self):
        """The boundary only means something if writes exist somewhere else.

        A workflow with no writes at all would pass every assertion above while
        proving nothing, so confirm the payment path is really present.
        """
        blob = json.dumps(self.workflow.get("tasks", []))
        planner_blob = json.dumps(self.planner)
        outside = blob.replace(planner_blob, "")
        for host in ("ap-backend", "payment-service"):
            self.assertIn(
                host, outside,
                f"Expected '{host}' to be called somewhere outside the planner task. "
                f"If the payment path has been removed, this test is passing "
                f"vacuously and is no longer evidence of anything.")

    def test_xa_write_http_tasks_explicitly_enlist(self):
        """An XA boundary is real only when both HTTP writes propagate its context."""
        tasks = {task.get("name"): task for task in self.workflow.get("tasks", [])}
        for name in ("Schedule_Invoice_For_Payment", "Create_Payment_Instruction"):
            self.assertIn(name, tasks, f"Missing required XA participant task {name}.")
            self.assertTrue(
                tasks[name].get("inputParameters", {}).get("enlistInTxn"),
                f"{name} must set inputParameters.enlistInTxn to true. Without it, "
                "Workflows does not propagate the XA transaction headers and a "
                "participant write can commit independently.")

    def test_xa_boundary_has_a_practical_timeout(self):
        """The XA task timeout is milliseconds and must cover remote enlistment."""
        begin = next(
            task for task in self.workflow.get("tasks", [])
            if task.get("name") == "Begin_Payment_Transaction")
        self.assertGreaterEqual(
            begin.get("inputParameters", {}).get("transactionTimeout", 0),
            300000,
            "The XA BEGIN transactionTimeout is milliseconds; use at least five minutes.")

    def test_transaction_opens_after_business_policy(self):
        """Every payment path passes the blog's business-policy stage."""
        names = [t.get("name") for t in self.workflow.get("tasks", [])]
        self.assertIn("Route_AP_Precheck", names)
        self.assertIn("Apply_Business_Policy", names)
        self.assertIn("Begin_Payment_Transaction", names)
        self.assertLess(
            names.index("Route_AP_Precheck"),
            names.index("Apply_Business_Policy"),
            "Apply_Business_Policy must follow mandatory precheck routing.")
        self.assertLess(
            names.index("Apply_Business_Policy"), names.index("Begin_Payment_Transaction"),
            "Begin_Payment_Transaction must follow Apply_Business_Policy. A clear "
            "invoice may skip investigation, but it must not skip business authority.")

    def test_exception_branch_resolves_before_payment_preparation(self):
        """Only an exception branch contains planner, verification, and review."""
        route = next(task for task in self.workflow["tasks"]
                     if task.get("name") == "Route_AP_Precheck")
        exception_tasks = route.get("decisionCases", {}).get("EXCEPTION", [])
        exception_names = [task.get("name") for task in exception_tasks]
        self.assertIn("Investigate_AP_Exception", exception_names)
        self.assertIn("Create_Structured_Decision_Contract", exception_names)
        self.assertIn("Verify_Investigation_Evidence", exception_names)
        self.assertNotIn("Apply_Business_Policy", exception_names)
        review_route = next(task for task in exception_tasks
                            if task.get("name") == "Request_Review_When_Planner_Escalates")
        review_tasks = review_route.get("decisionCases", {}).get("ESCALATE", [])
        self.assertTrue(
            any(task.get("type") == "HUMAN" and task.get("name") == "AP_Human_Review"
                for task in review_tasks),
            "A planner escalation must create AP_Human_Review before exception "
            "the shared business-policy step decides whether payment preparation can continue.")

    def test_workflow_has_exactly_one_human_task(self):
        """The demo has one review path, owned solely by planner escalation."""
        def walk(node):
            if isinstance(node, dict):
                yield node
                for value in node.values():
                    yield from walk(value)
            elif isinstance(node, list):
                for value in node:
                    yield from walk(value)

        human_tasks = [task for task in walk(self.workflow.get("tasks", []))
                       if task.get("type") == "HUMAN"]
        self.assertEqual(
            [task.get("name") for task in human_tasks], ["AP_Human_Review"],
            "Keep one Human task in this demo. Business policy must consume the "
            "planner-review result rather than create a second review path.")

    def test_payment_settlement_starts_after_commit(self):
        """The post-commit child workflow must never sit inside the XA scope."""
        names = [t.get("name") for t in self.workflow.get("tasks", [])]
        self.assertIn("Commit_Payment_Transaction", names)
        self.assertIn("Start_Payment_Settlement", names)
        self.assertLess(
            names.index("Commit_Payment_Transaction"),
            names.index("Start_Payment_Settlement"),
            "Start_Payment_Settlement must follow Commit_Payment_Transaction. "
            "External settlement and reconciliation must never be attempted inside "
            "the XA payment-preparation boundary.")


if __name__ == "__main__":
    unittest.main(verbosity=2)

import os
import uuid
from typing import TypedDict, Optional, Dict, Any
from langgraph.graph import StateGraph, END
from conductor.client.worker.worker_task import worker_task
from conductor.client.workflow.conductor_workflow import ConductorWorkflow
import logging
from conductor.client.automator.task_handler import TaskHandler

# --- Logging Initialization ---
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("LoanProcessingAgent")
from conductor.client.configuration.configuration import Configuration
from conductor.client.workflow.conductor_workflow import ConductorWorkflow
from conductor.client.workflow.executor.workflow_executor import WorkflowExecutor


# --- Define the State for the Loan Application ---
class LoanApplicationState(TypedDict):
    # Input fields
    application_id: str
    customer_details: Dict[str, Any]
    credit_score: int
    doc_verified: bool
    compliance_passed: bool
    requested_loan_amount: float
    annual_income: float
    monthly_debt_payments: float

    # Internal/Output fields
    prerequisites_met: Optional[bool]
    loan_exposure_valid: Optional[bool]
    dti_valid: Optional[bool]
    dti_ratio: Optional[float]
    loan_offer_details: Optional[Dict[str, Any]]
    application_status: str # "Pending", "Approved", "Rejected"
    rejection_reason: Optional[str]
    current_step_message: Optional[str] # To provide feedback at each step

# --- Define Node Functions ---

def check_prerequisites(state: LoanApplicationState) -> Dict[str, Any]:
    """
    Checks if basic prerequisites like document verification and compliance are met.
    """
    logger.debug(f"Entering check_prerequisites with application_id={state.get('application_id')}")
    print(f"\n--- Application ID: {state['application_id']} ---")
    print("Step 1: Checking Prerequisites...")
    if not state["doc_verified"]:
        logger.debug("Document verification failed (doc_verified is False)")
        print("   REJECTED: Document verification failed.")
        return {
            "prerequisites_met": False,
            "rejection_reason": "Document verification failed.",
            "application_status": "Rejected",
            "current_step_message": "Prerequisites check: Document verification failed."
        }
    if not state["compliance_passed"]:
        logger.debug("Compliance checks failed (compliance_passed is False)")
        print("   REJECTED: Compliance checks failed.")
        return {
            "prerequisites_met": False,
            "rejection_reason": "Compliance checks failed.",
            "application_status": "Rejected",
            "current_step_message": "Prerequisites check: Compliance checks failed."
        }
    print("   PASSED: Documents verified and compliance checks passed.")
    logger.debug("Prerequisites passed (doc_verified and compliance_passed are True)")
    return {
        "prerequisites_met": True,
        "current_step_message": "Prerequisites check: Passed."
    }

def validate_loan_exposure(state: LoanApplicationState) -> Dict[str, Any]:
    """
    Validates the loan exposure based on credit score, income, and requested amount.
    """
    logger.debug(f"Entering validate_loan_exposure with application_id={state.get('application_id')}, customer={state['customer_details'].get('name','N/A')}, credit_score={state.get('credit_score')}, annual_income={state.get('annual_income')}, requested_loan_amount={state.get('requested_loan_amount')}")
    print("Step 2: Validating Loan Exposure...")
    customer_name = state["customer_details"].get("name", "N/A")
    credit_score = state["credit_score"]
    annual_income = state["annual_income"]
    requested_loan_amount = state["requested_loan_amount"]

    # Policy: Minimum credit score for consideration
    MIN_CREDIT_SCORE = 620
    if credit_score < MIN_CREDIT_SCORE:
        logger.debug(f"Credit score {credit_score} is below minimum {MIN_CREDIT_SCORE}")
        reason = f"Credit score {credit_score} is below the minimum required {MIN_CREDIT_SCORE}."
        print(f"   REJECTED ({customer_name}): {reason}")
        return {
            "loan_exposure_valid": False,
            "rejection_reason": reason,
            "application_status": "Rejected",
            "current_step_message": f"Loan exposure validation: {reason}"
        }

    # Policy: Loan amount should not exceed a multiple of annual income
    MAX_LOAN_TO_INCOME_RATIO = 2.5 # Example: Max loan is 2.5x annual income
    max_allowed_based_on_income = annual_income * MAX_LOAN_TO_INCOME_RATIO
    if requested_loan_amount > max_allowed_based_on_income:
        logger.debug(f"Requested loan amount ({requested_loan_amount}) exceeds max allowed by income ({max_allowed_based_on_income})")
        reason = (f"Requested loan amount ${requested_loan_amount:,.2f} exceeds "
                  f"max allowed based on income (${max_allowed_based_on_income:,.2f}).")
        print(f"   REJECTED ({customer_name}): {reason}")
        return {
            "loan_exposure_valid": False,
            "rejection_reason": reason,
            "application_status": "Rejected",
            "current_step_message": f"Loan exposure validation: {reason}"
        }

    # Policy: Absolute maximum loan amount
    ABSOLUTE_MAX_LOAN_AMOUNT = 750000.00
    if requested_loan_amount > ABSOLUTE_MAX_LOAN_AMOUNT:
        logger.debug(f"Requested loan amount ({requested_loan_amount}) exceeds absolute max ({ABSOLUTE_MAX_LOAN_AMOUNT})")
        reason = (f"Requested loan amount ${requested_loan_amount:,.2f} exceeds "
                  f"the absolute maximum of ${ABSOLUTE_MAX_LOAN_AMOUNT:,.2f}.")
        print(f"   REJECTED ({customer_name}): {reason}")
        return {
            "loan_exposure_valid": False,
            "rejection_reason": reason,
            "application_status": "Rejected",
            "current_step_message": f"Loan exposure validation: {reason}"
        }

    print(f"   PASSED ({customer_name}): Loan exposure is within acceptable limits.")
    logger.debug(f"Loan exposure validation passed for customer {customer_name}.")
    return {
        "loan_exposure_valid": True,
        "current_step_message": "Loan exposure validation: Passed."
    }

def evaluate_dti(state: LoanApplicationState) -> Dict[str, Any]:
    """
    Evaluates the Debt-to-Income (DTI) ratio.
    """
    logger.debug(f"Entering evaluate_dti with application_id={state.get('application_id')}, customer={state['customer_details'].get('name','N/A')}, annual_income={state.get('annual_income')}, monthly_debt_payments={state.get('monthly_debt_payments')}")
    print("Step 3: Evaluating Debt-to-Income (DTI) Ratio...")
    customer_name = state["customer_details"].get("name", "N/A")
    annual_income = state["annual_income"]
    monthly_debt_payments = state["monthly_debt_payments"]

    if annual_income <= 0:
        logger.debug("Annual income <= 0, cannot calculate DTI.")
        reason = "Annual income must be positive to calculate DTI."
        print(f"   REJECTED ({customer_name}): {reason}")
        return {
            "dti_valid": False,
            "dti_ratio": None,
            "rejection_reason": reason,
            "application_status": "Rejected",
            "current_step_message": f"DTI evaluation: {reason}"
        }

    gross_monthly_income = annual_income / 12
    
    # For simplicity, DTI is based on existing debts. 
    # A more complex calculation might include an estimated payment for the new loan.
    dti_ratio = monthly_debt_payments / gross_monthly_income if gross_monthly_income > 0 else float('inf')
    logger.debug(f"Calculated DTI Ratio: {dti_ratio}")

    # Policy: Maximum DTI ratio
    MAX_DTI_RATIO = 0.43 # 43%
    if dti_ratio > MAX_DTI_RATIO:
        logger.debug(f"DTI ratio {dti_ratio:.4f} > MAX_DTI_RATIO {MAX_DTI_RATIO}")
        reason = f"DTI ratio {dti_ratio:.2%} exceeds the maximum allowed {MAX_DTI_RATIO:.0%}."
        print(f"   REJECTED ({customer_name}): {reason}")
        return {
            "dti_valid": False,
            "dti_ratio": dti_ratio,
            "rejection_reason": reason,
            "application_status": "Rejected",
            "current_step_message": f"DTI evaluation: {reason}"
        }

    print(f"   PASSED ({customer_name}): DTI ratio is {dti_ratio:.2%}, which is acceptable.")
    logger.debug(f"DTI evaluation passed for customer {customer_name}. Ratio: {dti_ratio:.4f}")
    return {
        "dti_valid": True,
        "dti_ratio": dti_ratio,
        "current_step_message": f"DTI evaluation: Passed with DTI {dti_ratio:.2%}."
    }

def generate_loan_offer(state: LoanApplicationState) -> Dict[str, Any]:
    """
    Generates a loan offer if all previous checks passed.
    """
    logger.debug(f"Entering generate_loan_offer with application_id={state.get('application_id')}, customer={state['customer_details'].get('name','N/A')}, credit_score={state.get('credit_score')}, requested_loan_amount={state.get('requested_loan_amount')}")
    print("Step 4: Generating Loan Offer...")
    customer_name = state["customer_details"].get("name", "N/A")
    credit_score = state["credit_score"]
    requested_loan_amount = state["requested_loan_amount"]

    interest_rate: float
    if credit_score >= 760:
        logger.debug(f"Credit score {credit_score} >= 760: setting interest_rate=0.05")
        interest_rate = 0.05 # 5%
    elif credit_score >= 700:
        logger.debug(f"Credit score {credit_score} >= 700: setting interest_rate=0.065")
        interest_rate = 0.065 # 6.5%
    elif credit_score >= 660:
        logger.debug(f"Credit score {credit_score} >= 660: setting interest_rate=0.08")
        interest_rate = 0.08 # 8%
    else: # Handles scores between MIN_CREDIT_SCORE (e.g. 620) and 659
        logger.debug(f"Credit score {credit_score} < 660: setting interest_rate=0.095")
        interest_rate = 0.095 # 9.5%

    # Assuming the full requested amount is offered if approved
    # Loan term could also be dynamic, but fixed here for simplicity
    loan_term_months = 60 

    offer_details = {
        "offered_loan_amount": requested_loan_amount,
        "interest_rate_annual": interest_rate,
        "term_months": loan_term_months,
        "estimated_monthly_payment": (requested_loan_amount * (1 + interest_rate * (loan_term_months/12))) / loan_term_months # Simplified for example
    }
    logger.debug(f"Loan offer generated for customer {customer_name}: {offer_details}")
    print(f"   APPROVED ({customer_name}): Loan offer generated.")
    print(f"     Offer Details: Amount: ${offer_details['offered_loan_amount']:,.2f}, "
          f"Rate: {offer_details['interest_rate_annual']:.1%}, Term: {offer_details['term_months']} months.")
    return {
        "loan_offer_details": offer_details,
        "application_status": "Approved",
        "rejection_reason": None, # Clear any prior tentative rejection reasons if any were set
        "current_step_message": "Loan offer generated successfully."
    }

# --- Define Conditional Edges ---

def decide_after_prerequisites(state: LoanApplicationState) -> str:
    logger.debug(f"decide_after_prerequisites: prerequisites_met={state.get('prerequisites_met')}")
    if state.get("prerequisites_met"):
        return "validate_loan_exposure"
    return END # Application rejected

def decide_after_loan_exposure(state: LoanApplicationState) -> str:
    logger.debug(f"decide_after_loan_exposure: loan_exposure_valid={state.get('loan_exposure_valid')}")
    if state.get("loan_exposure_valid"):
        return "evaluate_dti"
    return END # Application rejected

def decide_after_dti(state: LoanApplicationState) -> str:
    logger.debug(f"decide_after_dti: dti_valid={state.get('dti_valid')}")
    if state.get("dti_valid"):
        return "generate_loan_offer"
    return END # Application rejected


# --- Build the Graph ---
workflow = StateGraph(LoanApplicationState)

# Add nodes
workflow.add_node("check_prerequisites", check_prerequisites)
workflow.add_node("validate_loan_exposure", validate_loan_exposure)
workflow.add_node("evaluate_dti", evaluate_dti)
workflow.add_node("generate_loan_offer", generate_loan_offer)

# Set entry point
workflow.set_entry_point("check_prerequisites")

# Add conditional edges
workflow.add_conditional_edges(
    "check_prerequisites",
    decide_after_prerequisites
)
workflow.add_conditional_edges(
    "validate_loan_exposure",
    decide_after_loan_exposure
)
workflow.add_conditional_edges(
    "evaluate_dti",
    decide_after_dti
)

# Add edge from offer generation to end
workflow.add_edge("generate_loan_offer", END)

# Compile the graph
loan_processing_agent = workflow.compile()

application_data: LoanApplicationState = {
        "application_id": str(uuid.uuid4()),
        "customer_details": {"id": "EXT_CUST001", "name": "Eve External"},
        "credit_score": 750,
        "doc_verified": True,
        "compliance_passed": True,
        "requested_loan_amount": 30000.00,
        "annual_income": 100000.00,
        "monthly_debt_payments": 1500.00,
        "application_status": "Pending", # Initial status
         # These will be populated by the agent
        "prerequisites_met": None,
        "loan_exposure_valid": None,
        "dti_valid": None,
        "dti_ratio": None,
        "loan_offer_details": None,
        "rejection_reason": None,
        "current_step_message": None
    }

@worker_task(task_definition_name='loan_processing_agent_task')
def loan_processing_agent_task(task_input):
    logger.info(f"Received task input: {task_input}")
    result = loan_processing_agent.invoke(application_data)
    logger.info(f"Workflow result: {result}")
    print(result)
    return result

if __name__ == "__main__":
    logger.info("Starting Loan Processing Agent worker.")
    api_config = Configuration()
    # api_config = Configuration(base_url = "http://localhost:9010/workflow-server")
        # Starting the worker polling mechanism
    task_handler = TaskHandler(configuration=api_config)
    task_handler.start_processes()

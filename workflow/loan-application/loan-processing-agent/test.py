import uuid
from loan_processing_agent import loan_processing_agent, LoanApplicationState 

# --- Helper to print results ---
def print_final_result(application_id: str, result: LoanApplicationState):
    print(f"\n--- Final Result for Application ID: {application_id} ---")
    print(f"Status: {result['application_status']}")
    if result["application_status"] == "Approved":
        print("Loan Offer Details:")
        for key, value in result["loan_offer_details"].items():
            if isinstance(value, float) and ("amount" in key or "payment" in key) :
                 print(f"  {key.replace('_', ' ').title()}: ${value:,.2f}")
            elif isinstance(value, float) and "rate" in key:
                 print(f"  {key.replace('_', ' ').title()}: {value:.2%}")
            else:
                 print(f"  {key.replace('_', ' ').title()}: {value}")
    else:
        print(f"Rejection Reason: {result['rejection_reason']}")
    print("----------------------------------------------------")
    
def testLoanApproval():
    # Example 1: A potentially approvable application
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
    result = loan_processing_agent.invoke(application_data)
    print_final_result(application_data["application_id"], result)

def testLaonRejectionLowCreditScore():
    # Example 2: A potentially rejectable application (low credit score)
    application_data: LoanApplicationState = {
        "application_id": str(uuid.uuid4()),
        "customer_details": {"id": "EXT_CUST002", "name": "Frank Failing"},
        "credit_score": 580, # Low score
        "doc_verified": True,
        "compliance_passed": True,
        "requested_loan_amount": 10000.00,
        "annual_income": 40000.00,
        "monthly_debt_payments": 200.00,
        "application_status": "Pending",
        "prerequisites_met": None,
        "loan_exposure_valid": None,
        "dti_valid": None,
        "dti_ratio": None,
        "loan_offer_details": None,
        "rejection_reason": None,
        "current_step_message": None
    }
    result = loan_processing_agent.invoke(application_data)
    print_final_result(application_data["application_id"], result)

def testLoanRejectionHighDti():
    # Example 3: Rejected due to high DTI
    application_3_data = {
        "application_id": str(uuid.uuid4()),
        "customer_details": {"id": "CUST003", "name": "Charlie Brown"},
        "credit_score": 700,
        "doc_verified": True,
        "compliance_passed": True,
        "requested_loan_amount": 50000.00,
        "annual_income": 80000.00,
        "monthly_debt_payments": 3000.00, # High debt
        "application_status": "Pending"
    }
    result_3 = loan_processing_agent.invoke(application_3_data)
    print_final_result(application_3_data["application_id"], result_3)

def testLoanRejectionDocFailed():
    # Example 4: Rejected due to failed document verification
    application_4_data = {
        "application_id": str(uuid.uuid4()),
        "customer_details": {"id": "CUST004", "name": "Diana Prince"},
        "credit_score": 720,
        "doc_verified": False, # Fails here
        "compliance_passed": True,
        "requested_loan_amount": 30000.00,
        "annual_income": 100000.00,
        "monthly_debt_payments": 1000.00,
        "application_status": "Pending"
    }
    result_4 = loan_processing_agent.invoke(application_4_data)
    print_final_result(application_4_data["application_id"], result_4)

def testLaonRejectionHighLoanExposure():
    # Example 5: Rejected due to high loan exposure (requested amount too high for income)
    application_5_data = {
        "application_id": str(uuid.uuid4()),
        "customer_details": {"id": "CUST005", "name": "Edward Scissorhands"},
        "credit_score": 680,
        "doc_verified": True,
        "compliance_passed": True,
        "requested_loan_amount": 200000.00, # High amount
        "annual_income": 60000.00, # Relatively low income
        "monthly_debt_payments": 500.00,
        "application_status": "Pending"
    }
    result_5 = loan_processing_agent.invoke(application_5_data)
    print_final_result(application_5_data["application_id"], result_5)

def main():
    print("--- Running external script to invoke the loan processing agent ---")
    testLoanApproval()
    testLaonRejectionLowCreditScore()
    testLoanRejectionHighDti()
    testLoanRejectionDocFailed()
    testLaonRejectionHighLoanExposure()

if __name__ == "__main__":
    main()
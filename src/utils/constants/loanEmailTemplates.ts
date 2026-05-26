export const DEFAULT_LOAN_EMAIL_TEMPLATE = {
  subject: "Loan Application Submitted to Lender",
  body: `Hi {{Partner Name}},

A loan application submitted through your {{Brand Display Name}} dashboard has been successfully shared with the lender.

Application Details:

Application ID: {{Application ID}}
Client Name: {{Client Name}}
Loan Type: {{Loan Type}}
Lender: {{Bank / NBFC}}
Submission Date: {{Date}}

The lender will now review the application and may contact the client for further verification.

You can track the application status anytime from your dashboard.

Track Application

Best regards,
{{Brand Display Name}} Team`
};

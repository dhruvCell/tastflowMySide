# TODO: Handle Google Login Users in Forgot Password Flow

## Completed Tasks
- [x] Analyze the forgot password flow and identify Google login scenario
- [x] Read userController.js to understand current implementation
- [x] Read User.js model to confirm googleId field
- [x] Read ForgotPassword.js component to understand frontend handling
- [x] Add googleId check in forgotPassword function
- [x] Add googleId check in verifyOtp function
- [x] Add googleId check in resetPassword function
- [x] Fix frontend error handling in ForgotPassword component to display backend messages properly

## Summary
- Updated userController.js to handle Google login users in password reset flow
- Added appropriate notification message: "This account is registered via Google login. Please use Google login to access your account."
- Fixed frontend ForgotPassword component to properly handle 400 status responses from backend
- Frontend now displays specific error messages instead of generic "Server error"

## Testing
- Test forgot password with Google login user email
- Test forgot password with regular user email
- Verify notification message is displayed correctly

# TODO: Implement Invoice PDF Download Feature

## Pending Tasks
- [x] Install pdfkit npm package in the API project (already installed)
- [x] Create pdfInvoiceGenerator.js file with PDF generation logic using pdfkit
- [x] Implement generateInvoicePDF function in pdfInvoiceGenerator.js with good design and all invoice details
- [x] Add downloadInvoicePDF function in invoiceController.js to handle PDF download requests
- [x] Add new route '/admin/:invoiceId/download-pdf' in InvoiceRoute.js for PDF download
- [ ] Test the PDF download feature by calling the API endpoint

## Summary
- Add PDF download functionality for invoices using pdfkit
- Create a new file for PDF generation with professional invoice design
- Include all necessary invoice details: invoice number, date, user info, food items, prices, taxes, total, reserved table info if applicable
- Add new API endpoint to download invoice as PDF

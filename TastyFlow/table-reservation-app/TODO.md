# TODO: Add Message Display with Replies for Users in Info Section

## Completed Tasks
- [x] Analyze existing Info component and message API
- [x] Update Info.js to fetch messages for logged-in user
- [x] Add message display logic with replies
- [x] Add "View My Messages" button toggle
- [x] Update Info.css with message display styles
- [x] Add status badges (pending, replied, closed)
- [x] Style message cards and reply items

## Next Steps
- [ ] Test the message display functionality
- [ ] Verify API integration works correctly
- [ ] Test responsive design on different screen sizes
- [ ] Add error handling for failed message fetches
- [ ] Consider adding pagination if user has many messages

## Technical Details
- API Endpoint: GET /api/message/admin/all-reviews/:userId
- Message Model: Includes userId, message, replies array with adminId, content, date
- Status Types: pending, replied, closed
- UI Components: Message cards with status badges, reply threads

## Files Modified
- Info.js: Added message fetching and display logic
- Info.css: Added styles for message cards, status badges, replies

# Debug Guide for Bank User Addition

## Issue: Admin can't add users to the bank

### Possible Causes & Solutions

#### 1. **Not Logged In / Invalid Token**
- Check browser console (F12 → Console)
- Look for "Unauthorized" error message
- **Solution**: Login again with valid admin credentials

#### 2. **Wrong User Role**
- The logged-in user must have role `admin`
- **Check**: In browser console, run:
  ```javascript
  localStorage.getItem('token')  // Should have a token
  ```
- Login with a user that has `admin` role

#### 3. **Form Validation Errors**
After the recent update, you should now see error messages displayed in red on the form.

Common validation errors:
- **Name**: Must be at least 2 characters
- **Email**: Must be valid format (e.g., user@domain.com)
- **Password**: Must be at least 6 characters AND contain at least 1 letter and 1 number
  - ✅ Valid: `password123`, `User@123`, `donor123`
  - ❌ Invalid: `123456`, `password`, `user`
- **Role**: Must be `donor` or `patient`
- **Blood Group**: Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-

#### 4. **Database Connection Issue**
- **Check backend logs**: See if MongoDB is connected
- **Solution**: Run `npm start` in backend folder and check console

#### 5. **CORS or Network Issue**
- Check browser Network tab (F12 → Network)
- Click "Add" button and look for failed requests to `http://localhost:5000/admin/users`
- The request should return status 201 on success, 400 on validation error, 403 on forbidden, 401 on unauthorized

### Testing Steps

1. **Open Browser Console**: F12 → Console
2. **Check Token**: 
   ```javascript
   localStorage.getItem('token')
   localStorage.getItem('user')
   ```
3. **Try Adding a User** with:
   - Name: `Test Donor`
   - Email: `donor@test123.com`
   - Password: `testpass123` (has letters and numbers)
   - Role: `donor`
   - Blood Group: `A+`

4. **Read Error Messages**: Now displayed in red on the form
5. **Check Network Tab**: See actual API response

### Common Passwords That Work
- ✅ `test123`
- ✅ `password1`
- ✅ `donor123`
- ✅ `abc123`

### Common Passwords That DON'T Work
- ❌ `123456` (no letters)
- ❌ `password` (no numbers)
- ❌ `pass1` (too short)
- ❌ `12345` (too short, no letters)

---

## What Changed

### Frontend (`Admin.jsx`)
- Added error/success message display in red/green boxes
- Enhanced `addUser()` function to:
  - Validate empty fields
  - Catch API errors
  - Display error messages to user
  - Log errors to console for debugging

### Backend (`admin.js`)
- Validates all required fields
- Checks email format
- Enforces password strength (6+ chars, at least 1 letter + 1 number)
- Checks for duplicate emails
- Returns clear error messages

---

## Quick Fix Checklist
- [ ] Backend running? (`npm start` in backend folder)
- [ ] Frontend running? (`npm run dev` in frontend folder)
- [ ] Logged in as admin user?
- [ ] Password has both letters and numbers?
- [ ] Email doesn't already exist?
- [ ] Check error message on form?

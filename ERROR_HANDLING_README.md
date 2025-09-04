# Error Handling Documentation

This document describes the comprehensive error handling system implemented in the Signing Portal application.

## Overview

The error handling system provides a consistent, user-friendly way to display API errors throughout the application using a centralized ErrorModal component and standardized error processing utilities.

## Components

### 1. ErrorModal Component (`/src/pages/ComComponent/ErrorModal/ErrorModal.jsx`)

A reusable modal component that displays error messages to users. Features:
- User-friendly error display with proper styling
- Loading state support for async operations
- Portal-based rendering for proper z-index handling
- Click-to-dismiss functionality

**Usage:**
```jsx
{errorModal && (
  <ErrorModal onClick={() => setErrorModal(null)}>
    {errorModal}
  </ErrorModal>
)}
```

### 2. Error Handling Utilities (`/src/assets/utils/errorHandling.js`)

Centralized utilities for processing and displaying API errors:

#### `extractErrorMessage(error, defaultMessage)`
Intelligently extracts user-friendly error messages from various API response formats:
- String responses
- Object responses with `message`, `error`, or `detail` fields
- Validation error arrays
- HTTP status code mapping
- Network error handling

#### `handleApiError(error, setErrorModal, defaultMessage)`
Standardized error handler that logs errors and displays them via ErrorModal.

#### `withErrorHandling(operation, setErrorModal, defaultMessage)`
Promise wrapper for async operations with automatic error handling.

## Implementation

### Pages with Error Handling

#### 1. EventDetails.jsx
- **Event Loading Errors**: When fetching event details fails
- **Ticket Purchase Errors**: When ticket purchase API calls fail
- Displays specific error messages from the API

#### 2. Home.jsx
- **Event List Errors**: When fetching the events list fails
- Network connectivity issues
- Server errors

#### 3. YourSignings.jsx (Already implemented)
- **Ticket Fetching Errors**: When loading user's tickets fails
- **Cancellation Errors**: When ticket cancellation fails
- Action-based error handling with loader/action pattern

#### 4. SignIn.jsx (Already implemented)
- **Authentication Errors**: When Google sign-in fails
- BITS email validation errors

## Error Types Handled

### HTTP Status Codes
- **400**: Invalid request validation
- **401**: Authentication failures
- **403**: Permission denied
- **404**: Resource not found
- **409**: Conflict errors
- **429**: Rate limiting
- **500-504**: Server errors

### Network Errors
- Connection timeouts
- Network connectivity issues
- DNS resolution failures

### Custom API Errors
- Validation errors from forms
- Business logic errors
- Custom error messages from backend

## Best Practices

### 1. Consistent Error Display
All errors are displayed using the same ErrorModal component for consistency.

### 2. User-Friendly Messages
Technical error details are converted to user-friendly messages while preserving the original error in console logs for debugging.

### 3. Proper Error Logging
All errors are logged to the console with full details for development and debugging.

### 4. Graceful Degradation
When errors occur, the application provides fallback content and recovery options.

### 5. Context-Aware Messages
Error messages are tailored to the specific operation that failed (e.g., "Failed to load event details" vs "Failed to purchase tickets").

## Usage Examples

### Basic Error Handling in a Component

```jsx
import { useState } from 'react';
import { handleApiError } from '../../assets/utils/errorHandling.js';
import ErrorModal from '../ComComponent/ErrorModal/ErrorModal';

function MyComponent() {
  const [errorModal, setErrorModal] = useState(null);

  const handleApiCall = async () => {
    try {
      const response = await axios.get('/api/data');
      // Handle success
    } catch (error) {
      handleApiError(error, setErrorModal, "Failed to fetch data");
    }
  };

  return (
    <div>
      {errorModal && (
        <ErrorModal onClick={() => setErrorModal(null)}>
          {errorModal}
        </ErrorModal>
      )}
      {/* Component content */}
    </div>
  );
}
```

### Using withErrorHandling Wrapper

```jsx
import { withErrorHandling } from '../../assets/utils/errorHandling.js';

const fetchData = async () => {
  return await withErrorHandling(
    () => axios.get('/api/data'),
    setErrorModal,
    "Failed to fetch data"
  );
};
```

## Testing Error Scenarios

To test the error handling system:

1. **Network Errors**: Disconnect internet and try operations
2. **Server Errors**: Use invalid API endpoints
3. **Validation Errors**: Submit forms with invalid data
4. **Authentication Errors**: Use expired tokens
5. **Permission Errors**: Access restricted resources

## Future Enhancements

1. **Error Retry Mechanism**: Add automatic retry for transient errors
2. **Error Analytics**: Track error patterns for improvement
3. **Offline Support**: Handle offline scenarios gracefully
4. **Error Boundaries**: Implement React Error Boundaries for component-level error handling
5. **Toast Notifications**: Consider non-blocking error notifications for minor errors
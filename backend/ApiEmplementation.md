# Express.js HTTP Methods & Request Objects - Complete Guide

## Table of Contents
1. [HTTP Methods Overview](#http-methods-overview)
2. [Express Request Objects](#express-request-objects)
3. [Server-Side Implementation](#server-side-implementation)
4. [Client-Side Implementation with Axios](#client-side-implementation-with-axios)

---

## HTTP Methods Overview

### When to Use Each HTTP Method

| Method | Purpose | Has Body? | Idempotent? |
|--------|---------|-----------|-------------|
| **GET** | Retrieve/read data | No | Yes |
| **POST** | Create new resource | Yes | No |
| **PUT** | Update/replace entire resource | Yes | Yes |
| **PATCH** | Partially update resource | Yes | Yes |
| **DELETE** | Remove resource | No | Yes |

### Detailed Explanation

#### GET
- **Purpose**: Retrieve data from the server
- **When to use**: Fetching user profiles, listing products, searching, filtering
- **Characteristics**: 
  - Should not modify server data
  - Can be cached
  - Can be bookmarked
  - Data sent via URL (query parameters)

#### POST
- **Purpose**: Create a new resource
- **When to use**: Creating a new user, submitting a form, uploading a file
- **Characteristics**:
  - Data sent in request body
  - Not idempotent (multiple requests create multiple resources)
  - Cannot be bookmarked

#### PUT
- **Purpose**: Update or replace an entire resource
- **When to use**: Updating complete user profile, replacing a document
- **Characteristics**:
  - Requires full resource data
  - Idempotent (same request = same result)
  - Data sent in request body

#### DELETE
- **Purpose**: Remove a resource
- **When to use**: Deleting a user account, removing a post
- **Characteristics**:
  - Idempotent
  - Usually no request body needed

---

## Express Request Objects

Express provides three main ways to access data from client requests:

### 1. req.body
**What it is**: Contains data sent in the request body (typically JSON)

**When to use**: 
- POST, PUT, PATCH requests
- When sending complex or sensitive data
- For form submissions

**Requirements**: Needs middleware to parse body data
```javascript
app.use(express.json()); // For JSON data
app.use(express.urlencoded({ extended: true })); // For form data
```

**Example Data Structure**:
```javascript
// Client sends:
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

// Server accesses via:
req.body.name // "John Doe"
req.body.email // "john@example.com"
```

---

### 2. req.params
**What it is**: Contains route parameters (part of the URL path)

**When to use**:
- Identifying specific resources
- RESTful URL structures
- Required path segments

**URL Structure**: `/users/:userId/posts/:postId`

**Example**:
```javascript
// URL: /users/123/posts/456
// Route: /users/:userId/posts/:postId

req.params.userId  // "123"
req.params.postId  // "456"
```

---

### 3. req.query
**What it is**: Contains query string parameters (after `?` in URL)

**When to use**:
- Optional filters
- Search parameters
- Pagination
- Sorting options

**URL Structure**: `/products?category=electronics&price=100&sort=asc`

**Example**:
```javascript
// URL: /products?category=electronics&price=100&sort=asc

req.query.category  // "electronics"
req.query.price     // "100"
req.query.sort      // "asc"
```

---

## Server-Side Implementation

### Complete Express Server Example

```javascript
const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory database (for demonstration)
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 30 }
];

// ============================================
// GET - Retrieve all users (with filtering)
// ============================================
app.get('/api/users', (req, res) => {
  // Access query parameters for filtering
  const { name, minAge } = req.query;
  
  let filteredUsers = users;
  
  // Filter by name if provided
  if (name) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  // Filter by minimum age if provided
  if (minAge) {
    filteredUsers = filteredUsers.filter(user => 
      user.age >= parseInt(minAge)
    );
  }
  
  res.json({
    success: true,
    count: filteredUsers.length,
    data: filteredUsers
  });
});

// ============================================
// GET - Retrieve a single user by ID
// ============================================
app.get('/api/users/:id', (req, res) => {
  // Access route parameter
  const userId = parseInt(req.params.id);
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// ============================================
// POST - Create a new user
// ============================================
app.post('/api/users', (req, res) => {
  // Access request body
  const { name, email, age } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    age: age || null
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
});

// ============================================
// PUT - Update entire user
// ============================================
app.put('/api/users/:id', (req, res) => {
  // Access route parameter and request body
  const userId = parseInt(req.params.id);
  const { name, email, age } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Replace entire user object
  users[userIndex] = {
    id: userId,
    name,
    email,
    age
  };
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: users[userIndex]
  });
});

// ============================================
// PATCH - Partially update user
// ============================================
app.patch('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Update only provided fields
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    id: userId // Ensure ID doesn't change
  };
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: users[userIndex]
  });
});

// ============================================
// DELETE - Remove a user
// ============================================
app.delete('/api/users/:id', (req, res) => {
  // Access route parameter
  const userId = parseInt(req.params.id);
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);
  
  res.json({
    success: true,
    message: 'User deleted successfully',
    data: deletedUser
  });
});

// ============================================
// Complex Example: Combining params and query
// ============================================
app.get('/api/users/:id/posts', (req, res) => {
  const userId = parseInt(req.params.id); // Route parameter
  const { limit, offset } = req.query; // Query parameters
  
  res.json({
    userId,
    limit: limit || 10,
    offset: offset || 0,
    message: 'This would return user posts with pagination'
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Client-Side Implementation with Axios

### Installation
```bash
npm install axios
```

### Basic Setup

```javascript
import axios from 'axios';

// Base URL configuration (optional but recommended)
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

### GET Requests

#### Example 1: Get all users
```javascript
// Simple GET request
async function getAllUsers() {
  try {
    const response = await axios.get('http://localhost:3000/api/users');
    console.log(response.data);
    // Output: { success: true, count: 2, data: [...] }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

#### Example 2: Get users with query parameters
```javascript
// GET with query parameters (filtering)
async function searchUsers() {
  try {
    const response = await axios.get('http://localhost:3000/api/users', {
      params: {
        name: 'Alice',
        minAge: 20
      }
    });
    // URL becomes: /api/users?name=Alice&minAge=20
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

#### Example 3: Get single user by ID (using params)
```javascript
// GET with route parameter
async function getUserById(userId) {
  try {
    const response = await axios.get(`http://localhost:3000/api/users/${userId}`);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getUserById(1); // Calls: /api/users/1
```

---

### POST Requests

#### Example 1: Create a new user
```javascript
// POST with request body
async function createUser() {
  try {
    const userData = {
      name: 'Charlie',
      email: 'charlie@example.com',
      age: 28
    };
    
    const response = await axios.post(
      'http://localhost:3000/api/users',
      userData  // Request body (becomes req.body on server)
    );
    
    console.log(response.data);
    // Output: { success: true, message: '...', data: {...} }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

#### Example 2: POST with headers
```javascript
// POST with custom headers
async function createUserWithAuth() {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/users',
      {
        name: 'Diana',
        email: 'diana@example.com',
        age: 32
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

---

### PUT Requests

#### Example 1: Update entire user
```javascript
// PUT - Replace entire resource
async function updateUser(userId) {
  try {
    const updatedData = {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      age: 26
    };
    
    const response = await axios.put(
      `http://localhost:3000/api/users/${userId}`,
      updatedData  // Request body (becomes req.body on server)
    );
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

updateUser(1); // Updates user with ID 1
```

---

### PATCH Requests

#### Example 1: Partially update user
```javascript
// PATCH - Update only specific fields
async function updateUserEmail(userId, newEmail) {
  try {
    const response = await axios.patch(
      `http://localhost:3000/api/users/${userId}`,
      { email: newEmail }  // Only update email field
    );
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

updateUserEmail(1, 'newemail@example.com');
```

---

### DELETE Requests

#### Example 1: Delete a user
```javascript
// DELETE request
async function deleteUser(userId) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/users/${userId}`
    );
    
    console.log(response.data);
    // Output: { success: true, message: 'User deleted successfully', data: {...} }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

deleteUser(2); // Deletes user with ID 2
```

#### Example 2: DELETE with request body (if needed)
```javascript
// DELETE with optional body (less common)
async function deleteUserWithReason(userId) {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/users/${userId}`,
      {
        data: {  // Note: body data goes in 'data' property for DELETE
          reason: 'User requested account deletion'
        }
      }
    );
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

---

### Complete Client Example

```javascript
// Complete client-side API service
class UserAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.api = axios.create({ baseURL });
  }
  
  // GET all users with optional filters
  async getAll(filters = {}) {
    const response = await this.api.get('/users', { params: filters });
    return response.data;
  }
  
  // GET single user
  async getById(id) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }
  
  // POST - Create user
  async create(userData) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }
  
  // PUT - Update entire user
  async update(id, userData) {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }
  
  // PATCH - Partial update
  async partialUpdate(id, updates) {
    const response = await this.api.patch(`/users/${id}`, updates);
    return response.data;
  }
  
  // DELETE user
  async delete(id) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }
}

// Usage
const userAPI = new UserAPI();

// Examples
(async () => {
  try {
    // Get all users
    const allUsers = await userAPI.getAll();
    console.log('All users:', allUsers);
    
    // Search users
    const filtered = await userAPI.getAll({ name: 'Alice', minAge: 20 });
    console.log('Filtered:', filtered);
    
    // Create user
    const newUser = await userAPI.create({
      name: 'Eve',
      email: 'eve@example.com',
      age: 27
    });
    console.log('Created:', newUser);
    
    // Update user
    const updated = await userAPI.update(1, {
      name: 'Alice Updated',
      email: 'alice.new@example.com',
      age: 26
    });
    console.log('Updated:', updated);
    
    // Partial update
    const patched = await userAPI.partialUpdate(1, { age: 27 });
    console.log('Patched:', patched);
    
    // Delete user
    const deleted = await userAPI.delete(2);
    console.log('Deleted:', deleted);
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
})();
```

---

## Quick Reference Summary

### Request Object Properties

| Property | Usage | Example |
|----------|-------|---------|
| `req.body` | Data in request body | `req.body.name` |
| `req.params` | Route parameters | `req.params.id` from `/users/:id` |
| `req.query` | Query string parameters | `req.query.search` from `/users?search=john` |

### Axios Method Signatures

```javascript
// GET
axios.get(url, { params: { key: 'value' } })

// POST
axios.post(url, { data: 'value' })

// PUT
axios.put(url, { data: 'value' })

// PATCH
axios.patch(url, { data: 'value' })

// DELETE
axios.delete(url)
axios.delete(url, { data: { reason: 'value' } }) // with body
```

---

## Best Practices

1. **Use appropriate HTTP methods**: Don't use POST for everything
2. **Validate input**: Always validate `req.body`, `req.params`, and `req.query`
3. **Handle errors**: Use try-catch blocks and proper error responses
4. **Return appropriate status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
5. **Use middleware**: `express.json()` for parsing JSON bodies
6. **Keep URLs RESTful**: `/api/users/:id` not `/api/getUserById`
7. **Version your API**: `/api/v1/users` for future compatibility

---

## Common Pitfalls

❌ **Wrong**: Using POST to fetch data
```javascript
app.post('/api/getUsers', ...); // Don't do this
```

✅ **Correct**: Use GET to fetch data
```javascript
app.get('/api/users', ...);
```

---

❌ **Wrong**: Sending sensitive data in query parameters
```javascript
axios.get('/api/login?password=12345'); // Passwords visible in URL!
```

✅ **Correct**: Send sensitive data in request body
```javascript
axios.post('/api/login', { password: '12345' });
```

---

❌ **Wrong**: Forgetting to parse JSON body
```javascript
// req.body will be undefined without middleware
app.post('/api/users', (req, res) => {
  console.log(req.body); // undefined
});
```

✅ **Correct**: Add JSON parsing middleware
```javascript
app.use(express.json());
app.post('/api/users', (req, res) => {
  console.log(req.body); // { name: '...', email: '...' }
});
```

---

## Additional Resources

- [Express.js Official Documentation](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

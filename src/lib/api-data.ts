export const BASE_URL = "https://api.apibee.io";

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface Endpoint {
  method: Method;
  path: string;
  description: string;
  params?: Param[];
  requestBody?: string;
  response: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  count: string;
  icon: string;
  endpoints: Endpoint[];
}

export const resources: Resource[] = [
  // ─── Users (JSON) ───
  {
    id: "users-json",
    title: "Users (JSON)",
    description: "Name, email, job, city. Looks like real people.",
    count: "5 users",
    icon: "👤",
    endpoints: [
      {
        method: "GET",
        path: "/api/user/getAllUsers",
        description: "Returns every user in the database.",
        response: `[
  {
    "userId": 101,
    "name": "Michael Thompson",
    "email": "michael.thompson@company.com",
    "job": "Senior Software Engineer",
    "city": "New York"
  },
  {
    "userId": 102,
    "name": "Emma Johnson",
    "email": "emma.johnson@company.com",
    "job": "Product Manager",
    "city": "San Francisco"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/user/user/{id}",
        description: "Pass an ID, get one user back.",
        params: [{ name: "id", type: "integer", required: true, description: "User ID (e.g. 101)" }],
        response: `{
  "userId": 101,
  "name": "Michael Thompson",
  "email": "michael.thompson@company.com",
  "job": "Senior Software Engineer",
  "city": "New York"
}`,
      },
      {
        method: "POST",
        path: "/api/user/addUser",
        description: "Send a JSON body, get the new user back with an ID.",
        requestBody: `{
  "name": "Tony Thompson",
  "email": "tony.thompson@company.com",
  "job": "Senior Software Engineer",
  "city": "New York"
}`,
        response: `{
  "message": "User created successfully",
  "data": {
    "userId": 723,
    "name": "Tony Thompson",
    "email": "tony.thompson@company.com",
    "job": "Senior Software Engineer",
    "city": "New York"
  }
}`,
      },
      {
        method: "PUT",
        path: "/api/user/update/{id}",
        description: "Overwrite a user's fields. Returns the updated object.",
        params: [{ name: "id", type: "integer", required: true, description: "User ID to update" }],
        requestBody: `{
  "name": "John Doe",
  "email": "John.Doe@company.com",
  "job": "Software Engineer",
  "city": "New York"
}`,
        response: `{
  "message": "User updated successfully",
  "data": {
    "userId": 101,
    "name": "John Doe",
    "email": "John.Doe@company.com",
    "job": "Software Engineer",
    "city": "New York"
  }
}`,
      },
      {
        method: "DELETE",
        path: "/api/user/delete/{id}",
        description: "Deletes the user. Gone. (Not really — resets later.)",
        params: [{ name: "id", type: "integer", required: true, description: "User ID to delete" }],
        response: `{
  "message": "User deleted successfully"
}`,
      },
    ],
  },

  // ─── Users (XML) ───
  {
    id: "users-xml",
    title: "Users (XML)",
    description: "Same users, but the response comes back as XML.",
    count: "4 users",
    icon: "📄",
    endpoints: [
      {
        method: "GET",
        path: "/api/xml/UserXML/all",
        description: "All users, wrapped in angle brackets.",
        response: `<ArrayOfUserXmlResponse>
  <UserXmlResponse>
    <Id>101</Id>
    <Name>Hiroshi Tanaka</Name>
    <Job>Engineer</Job>
    <City>Tokyo</City>
  </UserXmlResponse>
  <UserXmlResponse>
    <Id>102</Id>
    <Name>Maria Gonzales</Name>
    <Job>Doctor</Job>
    <City>Madrid</City>
  </UserXmlResponse>
</ArrayOfUserXmlResponse>`,
      },
      {
        method: "GET",
        path: "/api/xml/UserXML/{id}",
        description: "One user by ID. XML this time.",
        params: [{ name: "id", type: "integer", required: true, description: "User ID (e.g. 101)" }],
        response: `<User>
  <Id>101</Id>
  <Name>Hiroshi Tanaka</Name>
  <Job>Engineer</Job>
  <City>Tokyo</City>
</User>`,
      },
      {
        method: "POST",
        path: "/api/xml/UserXML/create",
        description: "POST an XML body, get the created user back.",
        requestBody: `<UserRequest>
  <Name>Tanaka San</Name>
  <Job>Engineer</Job>
  <City>Tokyo</City>
</UserRequest>`,
        response: `<User>
  <Id>1377</Id>
  <Name>Tanaka San</Name>
  <Job>Engineer</Job>
  <City>Tokyo</City>
</User>`,
      },
      {
        method: "PUT",
        path: "/api/xml/UserXML/update/{id}",
        description: "Update fields via XML body.",
        params: [{ name: "id", type: "integer", required: true, description: "User ID to update" }],
        requestBody: `<UserRequest>
  <Name>Tanaka San</Name>
  <Job>Engineer</Job>
  <City>Tokyo</City>
</UserRequest>`,
        response: `<User>
  <Id>101</Id>
  <Name>Tanaka San</Name>
  <Job>Engineer</Job>
  <City>Tokyo</City>
</User>`,
      },
      {
        method: "DELETE",
        path: "/api/xml/UserXML/delete/{id}",
        description: "Same delete, XML response.",
        params: [{ name: "id", type: "integer", required: true, description: "User ID to delete" }],
        response: `<string>User with ID 101 deleted</string>`,
      },
    ],
  },

  // ─── Auth ───
  {
    id: "auth-endpoints",
    title: "Auth Endpoints",
    description: "Log in, get a JWT back, use it on a protected route.",
    count: "JWT",
    icon: "🔐",
    endpoints: [
      {
        method: "POST",
        path: "/api/user/Login",
        description: "Send username + password, get a signed JWT back.",
        requestBody: `{
  "username": "Michael",
  "password": "Thompson"
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "loginTime": "2025-12-12 03:09:18",
  "expiresIn": 3600,
  "role": "Admin"
}`,
      },
      {
        method: "GET",
        path: "/api/admin/authorize",
        description: "Needs a Bearer token in the header. Returns a greeting if valid.",
        response: `"Hi, I'm the Admin — how can I help you today?"`,
      },
    ],
  },

  // ─── Products ───
  {
    id: "products",
    title: "Products",
    description: "E-commerce items with title, price, category, image, and rating.",
    count: "20 products",
    icon: "🛍️",
    endpoints: [
      {
        method: "GET",
        path: "/api/products",
        description: "All products. Supports ?limit, ?page, ?sort, ?order, ?category, ?q.",
        response: `[
  {
    "id": 1,
    "title": "Wireless Noise-Cancelling Headphones",
    "price": 249.99,
    "description": "Over-ear headphones with 30hr battery life and active noise cancellation.",
    "category": "electronics",
    "image": "https://picsum.photos/seed/prod1/400/400",
    "rating": { "rate": 4.3, "count": 127 },
    "inStock": true,
    "createdAt": "2025-06-12T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Mechanical Keyboard RGB",
    "price": 89.99,
    "description": "Hot-swappable switches, per-key RGB, USB-C.",
    "category": "electronics",
    "image": "https://picsum.photos/seed/prod2/400/400",
    "rating": { "rate": 4.7, "count": 84 },
    "inStock": true,
    "createdAt": "2025-06-15T08:00:00Z"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/products/{id}",
        description: "One product by ID.",
        params: [{ name: "id", type: "integer", required: true, description: "Product ID" }],
        response: `{
  "id": 1,
  "title": "Wireless Noise-Cancelling Headphones",
  "price": 249.99,
  "description": "Over-ear headphones with 30hr battery life and active noise cancellation.",
  "category": "electronics",
  "image": "https://picsum.photos/seed/prod1/400/400",
  "rating": { "rate": 4.3, "count": 127 },
  "inStock": true,
  "createdAt": "2025-06-12T10:30:00Z"
}`,
      },
      {
        method: "GET",
        path: "/api/products/categories",
        description: "Just the category names. Returns a string array.",
        response: `["electronics", "clothing", "books", "home", "sports"]`,
      },
      {
        method: "GET",
        path: "/api/products/category/{name}",
        description: "All products in one category.",
        params: [{ name: "name", type: "string", required: true, description: "Category name (e.g. electronics)" }],
        response: `[
  { "id": 1, "title": "Wireless Headphones", "price": 249.99, "category": "electronics", "..." : "..." },
  { "id": 2, "title": "Mechanical Keyboard", "price": 89.99, "category": "electronics", "..." : "..." }
]`,
      },
      {
        method: "POST",
        path: "/api/products",
        description: "Create a product. Returns it with a generated ID.",
        requestBody: `{
  "title": "USB-C Hub 7-in-1",
  "price": 45.99,
  "description": "HDMI, USB-A x3, SD, microSD, USB-C PD.",
  "category": "electronics"
}`,
        response: `{
  "message": "Product created successfully",
  "data": {
    "id": 21,
    "title": "USB-C Hub 7-in-1",
    "price": 45.99,
    "description": "HDMI, USB-A x3, SD, microSD, USB-C PD.",
    "category": "electronics",
    "createdAt": "2025-07-18T12:00:00Z"
  }
}`,
      },
      {
        method: "PUT",
        path: "/api/products/{id}",
        description: "Update a product's fields.",
        params: [{ name: "id", type: "integer", required: true, description: "Product ID" }],
        requestBody: `{
  "title": "Updated Headphones Pro",
  "price": 279.99
}`,
        response: `{
  "message": "Product updated successfully",
  "data": { "id": 1, "title": "Updated Headphones Pro", "price": 279.99, "..." : "..." }
}`,
      },
      {
        method: "DELETE",
        path: "/api/products/{id}",
        description: "Remove a product. Doesn't really persist.",
        params: [{ name: "id", type: "integer", required: true, description: "Product ID" }],
        response: `{ "message": "Product deleted successfully" }`,
      },
    ],
  },

  // ─── Posts ───
  {
    id: "posts",
    title: "Posts",
    description: "Blog-style content. Title, body, tags, likes. Linked to users.",
    count: "15 posts",
    icon: "📝",
    endpoints: [
      {
        method: "GET",
        path: "/api/posts",
        description: "All posts. Filter by ?userId=101 or search with ?q=rest.",
        response: `[
  {
    "id": 1,
    "userId": 101,
    "title": "Getting Started with REST APIs",
    "body": "REST APIs are the backbone of modern web applications...",
    "tags": ["api", "tutorial", "beginner"],
    "publishedAt": "2025-07-10T14:00:00Z",
    "likes": 42
  }
]`,
      },
      {
        method: "GET",
        path: "/api/posts/{id}",
        description: "Single post by ID.",
        params: [{ name: "id", type: "integer", required: true, description: "Post ID" }],
        response: `{
  "id": 1,
  "userId": 101,
  "title": "Getting Started with REST APIs",
  "body": "REST APIs are the backbone of modern web applications. In this post...",
  "tags": ["api", "tutorial", "beginner"],
  "publishedAt": "2025-07-10T14:00:00Z",
  "likes": 42
}`,
      },
      {
        method: "GET",
        path: "/api/posts/{id}/comments",
        description: "All comments on a specific post.",
        params: [{ name: "id", type: "integer", required: true, description: "Post ID" }],
        response: `[
  {
    "id": 1,
    "postId": 1,
    "userId": 103,
    "body": "Great writeup, exactly what I needed.",
    "createdAt": "2025-07-10T15:23:00Z"
  }
]`,
      },
      {
        method: "POST",
        path: "/api/posts",
        description: "Create a post.",
        requestBody: `{
  "userId": 101,
  "title": "My New Post",
  "body": "This is the content...",
  "tags": ["demo"]
}`,
        response: `{
  "message": "Post created successfully",
  "data": { "id": 16, "userId": 101, "title": "My New Post", "..." : "..." }
}`,
      },
      {
        method: "PUT",
        path: "/api/posts/{id}",
        description: "Update a post.",
        params: [{ name: "id", type: "integer", required: true, description: "Post ID" }],
        requestBody: `{ "title": "Updated Title", "body": "New content..." }`,
        response: `{
  "message": "Post updated successfully",
  "data": { "id": 1, "title": "Updated Title", "..." : "..." }
}`,
      },
      {
        method: "DELETE",
        path: "/api/posts/{id}",
        description: "Delete a post.",
        params: [{ name: "id", type: "integer", required: true, description: "Post ID" }],
        response: `{ "message": "Post deleted successfully" }`,
      },
    ],
  },

  // ─── Comments ───
  {
    id: "comments",
    title: "Comments",
    description: "Linked to posts and users. Filter by postId.",
    count: "50 comments",
    icon: "💬",
    endpoints: [
      {
        method: "GET",
        path: "/api/comments",
        description: "All comments. Filter with ?postId=1 or ?userId=103.",
        response: `[
  {
    "id": 1,
    "postId": 1,
    "userId": 103,
    "body": "Great writeup, exactly what I needed.",
    "createdAt": "2025-07-10T15:23:00Z"
  },
  {
    "id": 2,
    "postId": 1,
    "userId": 102,
    "body": "Bookmarked. Sending this to my team.",
    "createdAt": "2025-07-10T16:45:00Z"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/comments/{id}",
        description: "Single comment.",
        params: [{ name: "id", type: "integer", required: true, description: "Comment ID" }],
        response: `{
  "id": 1,
  "postId": 1,
  "userId": 103,
  "body": "Great writeup, exactly what I needed.",
  "createdAt": "2025-07-10T15:23:00Z"
}`,
      },
      {
        method: "POST",
        path: "/api/comments",
        description: "Add a comment to a post.",
        requestBody: `{
  "postId": 1,
  "userId": 101,
  "body": "Thanks for sharing!"
}`,
        response: `{
  "message": "Comment created successfully",
  "data": { "id": 51, "postId": 1, "userId": 101, "body": "Thanks for sharing!", "createdAt": "2025-07-18T12:00:00Z" }
}`,
      },
      {
        method: "DELETE",
        path: "/api/comments/{id}",
        description: "Delete a comment.",
        params: [{ name: "id", type: "integer", required: true, description: "Comment ID" }],
        response: `{ "message": "Comment deleted successfully" }`,
      },
    ],
  },

  // ─── Todos ───
  {
    id: "todos",
    title: "Todos",
    description: "Task items with priority and due dates. The classic starter project.",
    count: "30 todos",
    icon: "✅",
    endpoints: [
      {
        method: "GET",
        path: "/api/todos",
        description: "All todos. Filter: ?completed=true, ?priority=high, ?userId=101.",
        response: `[
  {
    "id": 1,
    "userId": 101,
    "title": "Review pull request #42",
    "completed": false,
    "priority": "high",
    "dueDate": "2025-07-20"
  },
  {
    "id": 2,
    "userId": 102,
    "title": "Update README",
    "completed": true,
    "priority": "low",
    "dueDate": "2025-07-15"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/todos/{id}",
        description: "Single todo.",
        params: [{ name: "id", type: "integer", required: true, description: "Todo ID" }],
        response: `{
  "id": 1,
  "userId": 101,
  "title": "Review pull request #42",
  "completed": false,
  "priority": "high",
  "dueDate": "2025-07-20"
}`,
      },
      {
        method: "POST",
        path: "/api/todos",
        description: "Create a todo.",
        requestBody: `{
  "userId": 101,
  "title": "Write tests for auth module",
  "priority": "medium",
  "dueDate": "2025-07-25"
}`,
        response: `{
  "message": "Todo created successfully",
  "data": { "id": 31, "userId": 101, "title": "Write tests for auth module", "completed": false, "priority": "medium", "dueDate": "2025-07-25" }
}`,
      },
      {
        method: "PUT",
        path: "/api/todos/{id}",
        description: "Update a todo. Mark it done, change priority, whatever.",
        params: [{ name: "id", type: "integer", required: true, description: "Todo ID" }],
        requestBody: `{ "completed": true }`,
        response: `{
  "message": "Todo updated successfully",
  "data": { "id": 1, "completed": true, "..." : "..." }
}`,
      },
      {
        method: "DELETE",
        path: "/api/todos/{id}",
        description: "Delete a todo.",
        params: [{ name: "id", type: "integer", required: true, description: "Todo ID" }],
        response: `{ "message": "Todo deleted successfully" }`,
      },
    ],
  },

  // ─── Carts ───
  {
    id: "carts",
    title: "Carts",
    description: "Shopping carts with product items, quantities, and totals.",
    count: "8 carts",
    icon: "🛒",
    endpoints: [
      {
        method: "GET",
        path: "/api/carts",
        description: "All carts. Filter by ?userId=101.",
        response: `[
  {
    "id": 1,
    "userId": 101,
    "items": [
      { "productId": 3, "quantity": 2, "price": 29.99 },
      { "productId": 7, "quantity": 1, "price": 149.99 }
    ],
    "total": 209.97,
    "updatedAt": "2025-07-16T12:00:00Z"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/carts/{id}",
        description: "Single cart with all items.",
        params: [{ name: "id", type: "integer", required: true, description: "Cart ID" }],
        response: `{
  "id": 1,
  "userId": 101,
  "items": [
    { "productId": 3, "quantity": 2, "price": 29.99 },
    { "productId": 7, "quantity": 1, "price": 149.99 }
  ],
  "total": 209.97,
  "updatedAt": "2025-07-16T12:00:00Z"
}`,
      },
      {
        method: "POST",
        path: "/api/carts",
        description: "Create a cart.",
        requestBody: `{
  "userId": 101,
  "items": [
    { "productId": 1, "quantity": 1 }
  ]
}`,
        response: `{
  "message": "Cart created successfully",
  "data": { "id": 9, "userId": 101, "items": [{ "productId": 1, "quantity": 1, "price": 249.99 }], "total": 249.99 }
}`,
      },
      {
        method: "PUT",
        path: "/api/carts/{id}",
        description: "Update cart items.",
        params: [{ name: "id", type: "integer", required: true, description: "Cart ID" }],
        requestBody: `{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ]
}`,
        response: `{
  "message": "Cart updated successfully",
  "data": { "id": 1, "items": ["..."], "total": 549.97 }
}`,
      },
      {
        method: "DELETE",
        path: "/api/carts/{id}",
        description: "Delete a cart.",
        params: [{ name: "id", type: "integer", required: true, description: "Cart ID" }],
        response: `{ "message": "Cart deleted successfully" }`,
      },
    ],
  },

  // ─── Orders ───
  {
    id: "orders",
    title: "Orders",
    description: "Placed orders with items, status, and shipping address.",
    count: "12 orders",
    icon: "📦",
    endpoints: [
      {
        method: "GET",
        path: "/api/orders",
        description: "All orders. Filter: ?userId=101, ?status=shipped.",
        response: `[
  {
    "id": 1,
    "userId": 101,
    "items": [{ "productId": 3, "title": "Running Shoes", "quantity": 1, "price": 89.99 }],
    "total": 89.99,
    "status": "shipped",
    "shippingAddress": { "street": "123 Main St", "city": "New York", "zip": "10001" },
    "orderedAt": "2025-07-15T09:00:00Z"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/orders/{id}",
        description: "Single order with full details.",
        params: [{ name: "id", type: "integer", required: true, description: "Order ID" }],
        response: `{
  "id": 1,
  "userId": 101,
  "items": [{ "productId": 3, "title": "Running Shoes", "quantity": 1, "price": 89.99 }],
  "total": 89.99,
  "status": "shipped",
  "shippingAddress": { "street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "US" },
  "orderedAt": "2025-07-15T09:00:00Z",
  "deliveredAt": null
}`,
      },
      {
        method: "POST",
        path: "/api/orders",
        description: "Place an order.",
        requestBody: `{
  "userId": 101,
  "items": [{ "productId": 1, "quantity": 1 }],
  "shippingAddress": { "street": "456 Oak Ave", "city": "Austin", "zip": "73301" }
}`,
        response: `{
  "message": "Order created successfully",
  "data": { "id": 13, "status": "pending", "total": 249.99, "..." : "..." }
}`,
      },
      {
        method: "PUT",
        path: "/api/orders/{id}",
        description: "Update order status.",
        params: [{ name: "id", type: "integer", required: true, description: "Order ID" }],
        requestBody: `{ "status": "delivered" }`,
        response: `{
  "message": "Order updated successfully",
  "data": { "id": 1, "status": "delivered", "..." : "..." }
}`,
      },
    ],
  },

  // ─── Quotes ───
  {
    id: "quotes",
    title: "Quotes",
    description: "Programming and motivational quotes. Has a /random endpoint.",
    count: "50 quotes",
    icon: "💡",
    endpoints: [
      {
        method: "GET",
        path: "/api/quotes",
        description: "All quotes. Filter by ?category=programming.",
        response: `[
  {
    "id": 1,
    "text": "First, solve the problem. Then, write the code.",
    "author": "John Johnson",
    "category": "programming"
  },
  {
    "id": 2,
    "text": "Code is like humor. When you have to explain it, it's bad.",
    "author": "Cory House",
    "category": "programming"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/quotes/{id}",
        description: "Single quote.",
        params: [{ name: "id", type: "integer", required: true, description: "Quote ID" }],
        response: `{
  "id": 1,
  "text": "First, solve the problem. Then, write the code.",
  "author": "John Johnson",
  "category": "programming"
}`,
      },
      {
        method: "GET",
        path: "/api/quotes/random",
        description: "One random quote. Hit it again, get a different one.",
        response: `{
  "id": 17,
  "text": "Simplicity is the soul of efficiency.",
  "author": "Austin Freeman",
  "category": "wisdom"
}`,
      },
    ],
  },

  // ─── Recipes ───
  {
    id: "recipes",
    title: "Recipes",
    description: "Dishes with ingredients, instructions, cook time, and difficulty.",
    count: "15 recipes",
    icon: "🍳",
    endpoints: [
      {
        method: "GET",
        path: "/api/recipes",
        description: "All recipes. Filter: ?cuisine=Thai, ?difficulty=easy.",
        response: `[
  {
    "id": 1,
    "title": "Spicy Thai Basil Chicken",
    "cuisine": "Thai",
    "prepTime": 15,
    "cookTime": 10,
    "servings": 4,
    "difficulty": "medium",
    "ingredients": ["500g chicken breast", "1 cup thai basil", "4 cloves garlic"],
    "instructions": ["Dice the chicken.", "Stir-fry garlic.", "Add chicken, cook through.", "Fold in basil."],
    "image": "https://picsum.photos/seed/recipe1/600/400",
    "rating": 4.7,
    "tags": ["spicy", "quick", "asian"]
  }
]`,
      },
      {
        method: "GET",
        path: "/api/recipes/{id}",
        description: "Full recipe with all ingredients and steps.",
        params: [{ name: "id", type: "integer", required: true, description: "Recipe ID" }],
        response: `{
  "id": 1,
  "title": "Spicy Thai Basil Chicken",
  "cuisine": "Thai",
  "prepTime": 15,
  "cookTime": 10,
  "servings": 4,
  "difficulty": "medium",
  "ingredients": ["500g chicken breast", "1 cup thai basil leaves", "4 cloves garlic", "3 thai chilies", "2 tbsp soy sauce", "1 tbsp fish sauce", "1 tbsp oyster sauce"],
  "instructions": ["Dice the chicken into small cubes.", "Mince garlic and slice chilies.", "Heat oil in a wok over high heat.", "Stir-fry garlic and chilies for 30 seconds.", "Add chicken, cook until no longer pink.", "Add sauces, toss to coat.", "Remove from heat, fold in basil leaves."],
  "image": "https://picsum.photos/seed/recipe1/600/400",
  "rating": 4.7,
  "tags": ["spicy", "quick", "asian"]
}`,
      },
      {
        method: "GET",
        path: "/api/recipes/random",
        description: "One random recipe.",
        response: `{ "id": 8, "title": "Classic Margherita Pizza", "cuisine": "Italian", "..." : "..." }`,
      },
      {
        method: "GET",
        path: "/api/recipes/cuisines",
        description: "List of available cuisines.",
        response: `["Italian", "Thai", "Japanese", "Mexican", "Indian", "American"]`,
      },
    ],
  },

  // ─── Notifications ───
  {
    id: "notifications",
    title: "Notifications",
    description: "For building notification UIs. Types, read/unread state, timestamps.",
    count: "20 notifications",
    icon: "🔔",
    endpoints: [
      {
        method: "GET",
        path: "/api/notifications",
        description: "All notifications. Filter: ?userId=101, ?read=false.",
        response: `[
  {
    "id": 1,
    "userId": 101,
    "type": "mention",
    "title": "You were mentioned in a comment",
    "body": "Alice mentioned you in 'API Design Patterns'",
    "read": false,
    "link": "/posts/3",
    "createdAt": "2025-07-17T08:30:00Z"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/notifications/{id}",
        description: "Single notification.",
        params: [{ name: "id", type: "integer", required: true, description: "Notification ID" }],
        response: `{
  "id": 1,
  "userId": 101,
  "type": "mention",
  "title": "You were mentioned in a comment",
  "body": "Alice mentioned you in 'API Design Patterns'",
  "read": false,
  "link": "/posts/3",
  "createdAt": "2025-07-17T08:30:00Z"
}`,
      },
      {
        method: "PUT",
        path: "/api/notifications/{id}/read",
        description: "Mark a notification as read.",
        params: [{ name: "id", type: "integer", required: true, description: "Notification ID" }],
        response: `{ "message": "Notification marked as read" }`,
      },
      {
        method: "PUT",
        path: "/api/notifications/read-all",
        description: "Mark all notifications as read for a user.",
        requestBody: `{ "userId": 101 }`,
        response: `{ "message": "All notifications marked as read", "count": 7 }`,
      },
    ],
  },

  // ─── Transactions ───
  {
    id: "transactions",
    title: "Transactions",
    description: "For fintech dashboards. Debits, credits, categories, running balance.",
    count: "40 transactions",
    icon: "💳",
    endpoints: [
      {
        method: "GET",
        path: "/api/transactions",
        description: "All transactions. Filter: ?userId=101, ?type=debit, ?category=food.",
        response: `[
  {
    "id": 1,
    "userId": 101,
    "type": "debit",
    "amount": -42.50,
    "currency": "USD",
    "description": "Morning Coffee",
    "merchant": "Blue Bottle Coffee",
    "category": "food",
    "date": "2025-07-16T08:15:00Z",
    "balance": 1234.50
  },
  {
    "id": 2,
    "userId": 101,
    "type": "credit",
    "amount": 3500.00,
    "currency": "USD",
    "description": "Salary Deposit",
    "merchant": "TechCorp Inc.",
    "category": "salary",
    "date": "2025-07-15T00:00:00Z",
    "balance": 1277.00
  }
]`,
      },
      {
        method: "GET",
        path: "/api/transactions/{id}",
        description: "Single transaction.",
        params: [{ name: "id", type: "integer", required: true, description: "Transaction ID" }],
        response: `{
  "id": 1,
  "userId": 101,
  "type": "debit",
  "amount": -42.50,
  "currency": "USD",
  "description": "Morning Coffee",
  "merchant": "Blue Bottle Coffee",
  "category": "food",
  "date": "2025-07-16T08:15:00Z",
  "balance": 1234.50
}`,
      },
      {
        method: "GET",
        path: "/api/transactions/summary",
        description: "Aggregate totals: income, expenses, balance. Filter by ?userId.",
        response: `{
  "userId": 101,
  "totalIncome": 7000.00,
  "totalExpenses": -2845.50,
  "balance": 4154.50,
  "transactionCount": 23,
  "period": "2025-07"
}`,
      },
    ],
  },
];

export const codeExamples: Record<string, string> = {
  JavaScript: `fetch('${BASE_URL}/api/products?limit=5')
  .then(res => res.json())
  .then(data => console.log(data))`,

  Python: `import requests

res = requests.get('${BASE_URL}/api/products', params={'limit': 5})
print(res.json())`,

  cURL: `curl "${BASE_URL}/api/products?limit=5"`,

  Java: `HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/api/products?limit=5"))
    .build();

HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,

  PHP: `$response = file_get_contents(
  '${BASE_URL}/api/products?limit=5'
);
$products = json_decode($response, true);
print_r($products);`,
};

export const sampleResponse = `[
  {
    "id": 1,
    "title": "Wireless Noise-Cancelling Headphones",
    "price": 249.99,
    "category": "electronics",
    "rating": { "rate": 4.3, "count": 127 }
  },
  {
    "id": 2,
    "title": "Mechanical Keyboard RGB",
    "price": 89.99,
    "category": "electronics",
    "rating": { "rate": 4.7, "count": 84 }
  }
]`;

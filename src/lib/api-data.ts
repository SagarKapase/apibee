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
  },
  {
    "userId": 103,
    "name": "Liam Brown",
    "email": "liam.brown@company.com",
    "job": "DevOps Engineer",
    "city": "Toronto"
  }
]`,
      },
      {
        method: "GET",
        path: "/api/user/user/{id}",
        description: "Pass an ID, get one user back.",
        params: [
          {
            name: "id",
            type: "integer",
            required: true,
            description: "User ID (e.g. 101)",
          },
        ],
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
        params: [
          {
            name: "id",
            type: "integer",
            required: true,
            description: "User ID to update",
          },
        ],
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
        params: [
          {
            name: "id",
            type: "integer",
            required: true,
            description: "User ID to delete",
          },
        ],
        response: `{
  "message": "User deleted successfully"
}`,
      },
    ],
  },
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
        params: [
          {
            name: "id",
            type: "integer",
            required: true,
            description: "User ID (e.g. 101)",
          },
        ],
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
        params: [
          {
            name: "id",
            type: "integer",
            required: true,
            description: "User ID to update",
          },
        ],
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
        params: [
          {
            name: "id",
            type: "integer",
            required: true,
            description: "User ID to delete",
          },
        ],
        response: `<string>User with ID 101 deleted</string>`,
      },
    ],
  },
  {
    id: "auth",
    title: "Authentication",
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "loginTime": "2025-12-12 03:09:18",
  "expiresIn": 3600,
  "role": "Admin"
}`,
      },
      {
        method: "GET",
        path: "/api/admin/authorize",
        description:
          "Needs a Bearer token in the header. Returns a greeting if valid.",
        response: `"Hi, I'm the Admin — how can I help you today?"`,
      },
    ],
  },
];

export const codeExamples: Record<string, string> = {
  JavaScript: `fetch('${BASE_URL}/api/user/getAllUsers')
  .then(res => res.json())
  .then(json => console.log(json))`,

  Python: `import requests

res = requests.get('${BASE_URL}/api/user/getAllUsers')
print(res.json())`,

  cURL: `curl ${BASE_URL}/api/user/getAllUsers`,

  Java: `HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${BASE_URL}/api/user/getAllUsers"))
    .build();

HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,

  PHP: `$response = file_get_contents(
  '${BASE_URL}/api/user/getAllUsers'
);
$users = json_decode($response, true);
print_r($users);`,
};

export const sampleResponse = `[
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
]`;

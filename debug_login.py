import requests

url = "http://localhost:8000/api/v1/auth/login"
data = {
    "username": "testuser",
    "password": "testpassword"
}

response = requests.post(url, data=data)
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.json()}")

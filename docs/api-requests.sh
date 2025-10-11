#!/bin/bash

API_URL="http://localhost:3001"

echo "=== MAM Tours & Travel API Test Script ==="
echo ""

# Register
echo "1. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser@example.com","password":"password123"}')

echo $REGISTER_RESPONSE | jq '.'
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.accessToken')
echo ""

# Login
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}')

echo $LOGIN_RESPONSE | jq '.'
USER_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo ""

# Get vehicles
echo "3. Fetching available vehicles..."
curl -s $API_URL/api/vehicles | jq '.'
echo ""

# Create booking
echo "4. Creating a booking..."
TOMORROW=$(date -u -d "+1 day" +"%Y-%m-%dT10:00:00Z")
DAY_AFTER=$(date -u -d "+3 days" +"%Y-%m-%dT10:00:00Z")

BOOKING_RESPONSE=$(curl -s -X POST $API_URL/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d "{
    \"vehicleId\": 1,
    \"startAt\": \"$TOMORROW\",
    \"endAt\": \"$DAY_AFTER\",
    \"purpose\": \"SELF_DRIVE\",
    \"type\": \"DAILY\"
  }")

echo $BOOKING_RESPONSE | jq '.'
BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.id')
echo ""

# Get user bookings
echo "5. Fetching user bookings..."
curl -s $API_URL/api/bookings \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.'
echo ""

# Admin login
echo "6. Admin login..."
ADMIN_RESPONSE=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mamtours.ug","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.accessToken')
echo "Admin logged in"
echo ""

# Mark as hired
echo "7. Marking booking as hired (admin)..."
curl -s -X PUT $API_URL/api/bookings/$BOOKING_ID/mark-hired \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Mark as returned
echo "8. Marking booking as returned (admin)..."
curl -s -X PUT $API_URL/api/bookings/$BOOKING_ID/mark-returned \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# Usage report
echo "9. Getting usage report (admin)..."
curl -s $API_URL/api/reports/usage \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo "=== Test Complete ==="

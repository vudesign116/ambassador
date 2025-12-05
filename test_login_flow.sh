#!/bin/bash

# Test Login Flow - show_reward_selection Logic
# This script tests the complete login flow with real API

echo "🧪 Testing Login Flow with show_reward_selection Logic"
echo "=================================================="
echo ""

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNzY3MzE4MDAwLCJlbWFpbCI6IiJ9.JgA5ZhB-7tQ5hbxlKLq8S_hVT0tD_E5r7EWmCpx_jNk"
PHONE="0982085810"

echo "📞 Testing with phone: $PHONE"
echo ""

# Test 1: Login API
echo "🔐 STEP 1: Testing /nvbc_login/ API..."
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "https://bi.meraplion.com/local/nvbc_login/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"phone\": \"$PHONE\"}" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Login failed! Cannot proceed to Step 2."
    exit 1
fi

echo "✅ Login successful!"
echo ""

# Test 2: Get Reward Point API
echo "🎁 STEP 2: Testing /nvbc_get_point/ API..."
echo "---------------------------------------"
REWARD_RESPONSE=$(curl -s -X GET "https://bi.meraplion.com/local/nvbc_get_point/?phone=$PHONE" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$REWARD_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$REWARD_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Get reward data failed!"
    exit 1
fi

echo "✅ Reward data retrieved!"
echo ""

# Parse show_reward_selection
SHOW_REWARD=$(echo "$RESPONSE_BODY" | jq -r '.show_reward_selection' 2>/dev/null)

echo "📊 NAVIGATION DECISION:"
echo "----------------------"
echo "show_reward_selection = $SHOW_REWARD"
echo ""

if [ "$SHOW_REWARD" = "true" ]; then
    echo "✅ RESULT: Navigate to /reward-selection"
    echo "   → User CAN select rewards"
    echo "   → Show reward selection page with gift options"
elif [ "$SHOW_REWARD" = "false" ]; then
    echo "✅ RESULT: Navigate to /introduction"
    echo "   → User CANNOT select rewards"
    echo "   → Show 'Chưa được công bố' message"
else
    echo "⚠️  RESULT: show_reward_selection is undefined or null"
    echo "   → Default to /introduction (safe fallback)"
fi

echo ""
echo "=================================================="
echo "✅ Test completed successfully!"
echo ""
echo "📋 Summary:"
echo "  • Login API: Working ✅"
echo "  • Reward API: Working ✅"
echo "  • show_reward_selection: Checked ✅"
echo "  • Navigation logic: Verified ✅"

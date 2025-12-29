#!/bin/bash

# Test Login API với số điện thoại cụ thể
# Usage: ./test-login-api.sh [phone_number]

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_BASE_URL="https://bi.meraplion.com/local"
API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY3MzA3MTk5LCJpYXQiOjE3MzU3NzExOTksImp0aSI6IjhlNmQwZDQ1ZTlhOTQwMzdhZjY5ZWZhMWE2MzI4MWJiIiwidXNlcl9pZCI6MX0.X0U7g8z-hIquhEqJt2IprDOhf8K-_Kcp5TmS6ghdHnI"

# Default phone number
PHONE="${1:-0344406126}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔐 TEST LOGIN API${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📞 Phone Number: ${PHONE}${NC}"
echo ""

# Call Login API
echo -e "${YELLOW}⏳ Calling /get_data/get_nvbc_login?test=1&phone=... ...${NC}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "${API_BASE_URL}/get_data/get_nvbc_login/?test=1&phone=${PHONE}" \
  -H "Content-Type: application/json")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

# Extract response body (all except last line)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${BLUE}📡 HTTP Status: ${HTTP_CODE}${NC}"
echo ""

# Check HTTP status
if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Login API Success!${NC}"
  echo ""
  
  # Parse JSON response using jq (if available)
  if command -v jq &> /dev/null; then
    echo -e "${BLUE}📦 Response Data:${NC}"
    echo "$BODY" | jq '.'
    echo ""
    
    # Extract key fields
    PHONE_RESP=$(echo "$BODY" | jq -r '.phone // "N/A"')
    NAME=$(echo "$BODY" | jq -r '.name // "N/A"')
    MA_KH_DMS=$(echo "$BODY" | jq -r '.ma_kh_dms // "N/A"')
    POINT=$(echo "$BODY" | jq -r '.point // "N/A"')
    IS_VALID_INVITEE=$(echo "$BODY" | jq -r '.is_valid_invitee // "N/A"')
    INSERT_REFERRAL=$(echo "$BODY" | jq -r '.insert_referral // "N/A"')
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}📊 KEY FIELDS:${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "📞 Phone:             ${PHONE_RESP}"
    echo -e "👤 Name:              ${NAME}"
    echo -e "🏷️  Ma KH DMS:         ${MA_KH_DMS}"
    echo -e "⭐ Point:             ${POINT}"
    echo -e "🎯 is_valid_invitee:  ${IS_VALID_INVITEE}"
    echo -e "📝 insert_referral:   ${INSERT_REFERRAL}"
    echo ""
    
    # Check logic
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🔍 LOGIC CHECK:${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    if [ "$IS_VALID_INVITEE" == "true" ]; then
      echo -e "✅ is_valid_invitee = ${GREEN}true${NC}"
    else
      echo -e "❌ is_valid_invitee = ${RED}${IS_VALID_INVITEE}${NC}"
    fi
    
    if [ "$POINT" == "0" ]; then
      echo -e "✅ point = ${GREEN}0${NC}"
    else
      echo -e "❌ point = ${RED}${POINT}${NC}"
    fi
    
    echo ""
    
    if [ "$IS_VALID_INVITEE" == "true" ] && [ "$POINT" == "0" ]; then
      echo -e "${GREEN}========================================${NC}"
      echo -e "${GREEN}✅ HIỆN POPUP NGƯỜI GIỚI THIỆU${NC}"
      echo -e "${GREEN}========================================${NC}"
    else
      echo -e "${RED}========================================${NC}"
      echo -e "${RED}❌ KHÔNG HIỆN POPUP${NC}"
      echo -e "${RED}========================================${NC}"
    fi
    
  else
    # jq not available, print raw JSON
    echo -e "${YELLOW}⚠️  jq not installed, showing raw JSON:${NC}"
    echo "$BODY"
  fi
  
  # ✅ NOW CALL REWARD API TO GET POINT
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}🎁 CALLING REWARD API${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  echo -e "${YELLOW}⏳ Calling /nvbc_get_point/ ...${NC}"
  echo ""
  
  REWARD_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X GET "${API_BASE_URL}/nvbc_get_point/?phone=${PHONE}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${API_TOKEN}")
  
  REWARD_HTTP_CODE=$(echo "$REWARD_RESPONSE" | tail -n 1)
  REWARD_BODY=$(echo "$REWARD_RESPONSE" | sed '$d')
  
  echo -e "${BLUE}📡 HTTP Status: ${REWARD_HTTP_CODE}${NC}"
  echo ""
  
  if [ "$REWARD_HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Reward API Success!${NC}"
    echo ""
    
    if command -v jq &> /dev/null; then
      echo -e "${BLUE}📦 Response Data:${NC}"
      echo "$REWARD_BODY" | jq '.'
      echo ""
      
      # Extract point
      POINT_FROM_REWARD=$(echo "$REWARD_BODY" | jq -r '.point // "N/A"')
      SHOW_REWARD=$(echo "$REWARD_BODY" | jq -r '.show_reward_selection // "N/A"')
      
      echo -e "${BLUE}========================================${NC}"
      echo -e "${BLUE}📊 REWARD STATUS:${NC}"
      echo -e "${BLUE}========================================${NC}"
      echo -e "⭐ Point:                  ${POINT_FROM_REWARD}"
      echo -e "🎁 show_reward_selection: ${SHOW_REWARD}"
      echo ""
      
      # ✅ FINAL LOGIC CHECK WITH BOTH APIs
      echo -e "${GREEN}========================================${NC}"
      echo -e "${GREEN}🔍 FINAL LOGIC CHECK (LOGIN + REWARD):${NC}"
      echo -e "${GREEN}========================================${NC}"
      
      if [ "$IS_VALID_INVITEE" == "true" ]; then
        echo -e "✅ is_valid_invitee (from login) = ${GREEN}true${NC}"
      else
        echo -e "❌ is_valid_invitee (from login) = ${RED}${IS_VALID_INVITEE}${NC}"
      fi
      
      if [ "$POINT_FROM_REWARD" == "0" ]; then
        echo -e "✅ point (from reward) = ${GREEN}0${NC}"
      else
        echo -e "❌ point (from reward) = ${RED}${POINT_FROM_REWARD}${NC}"
      fi
      
      echo ""
      
      if [ "$IS_VALID_INVITEE" == "true" ] && [ "$POINT_FROM_REWARD" == "0" ]; then
        echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ HIỆN POPUP NGƯỜI GIỚI THIỆU       ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
      else
        echo -e "${RED}╔════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ❌ KHÔNG HIỆN POPUP                  ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════╝${NC}"
        
        if [ "$IS_VALID_INVITEE" != "true" ]; then
          echo -e "${YELLOW}  Lý do: is_valid_invitee ≠ true${NC}"
        elif [ "$POINT_FROM_REWARD" != "0" ]; then
          echo -e "${YELLOW}  Lý do: point ≠ 0 (user đã có điểm)${NC}"
        fi
      fi
      
    else
      echo -e "${YELLOW}⚠️  jq not installed, showing raw JSON:${NC}"
      echo "$REWARD_BODY"
    fi
  else
    echo -e "${RED}❌ Reward API Error (HTTP ${REWARD_HTTP_CODE})${NC}"
    echo "$REWARD_BODY"
  fi
  
elif [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${RED}❌ Phone not found in system (HTTP 400)${NC}"
  echo "$BODY"
  
elif [ "$HTTP_CODE" -ge 500 ]; then
  echo -e "${RED}❌ Server error (HTTP ${HTTP_CODE})${NC}"
  echo "$BODY"
  
else
  echo -e "${RED}❌ API Error (HTTP ${HTTP_CODE})${NC}"
  echo "$BODY"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}📚 Usage:${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Test with different phone:"
echo "  ./test-login-api.sh 0987654321"
echo ""
echo "Install jq for better JSON parsing:"
echo "  brew install jq"
echo ""

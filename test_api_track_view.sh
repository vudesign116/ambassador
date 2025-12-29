#!/bin/bash

# 🧪 TEST API TRACK DOCUMENT VIEW
# Thông tin test: phone=0935025858, ma_kh_dms=00180400, document_id=12

echo "========================================"
echo "🧪 TESTING TRACK DOCUMENT VIEW API"
echo "========================================"
echo ""

# Test data
PHONE="0935025858"
MA_KH_DMS="00180400"
DOCUMENT_ID="12"
WATCH_DURATION=125  # 125 giây (> 120s = 100%)
TIME_RATE=1.0       # 100%
BASE_POINT=4
EFFECTIVE_POINT=4
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")

echo "📊 Test Data:"
echo "  • Phone: $PHONE"
echo "  • Ma KH DMS: $MA_KH_DMS"
echo "  • Document ID: $DOCUMENT_ID"
echo "  • Watch Duration: $WATCH_DURATION seconds"
echo "  • Time Rate: $TIME_RATE (100%)"
echo "  • Base Point: $BASE_POINT"
echo "  • Effective Point: $EFFECTIVE_POINT"
echo "  • Timestamp: $TIMESTAMP"
echo ""

# Test 1: Normal mode (sẽ bị program pause)
echo "----------------------------------------"
echo "📝 Test 1: NORMAL MODE (without test=1)"
echo "Expected: Program paused error"
echo "----------------------------------------"
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/" \
  -H "Content-Type: application/json" \
  -d "[{
    \"ma_kh_dms\":\"$MA_KH_DMS\",
    \"phone\":\"$PHONE\",
    \"document_id\":\"$DOCUMENT_ID\",
    \"watch_duration_seconds\":$WATCH_DURATION,
    \"time_rate\":$TIME_RATE,
    \"base_point\":$BASE_POINT,
    \"effective_point\":$EFFECTIVE_POINT,
    \"inserted_at\":\"$TIMESTAMP\"
  }]"

echo ""
echo ""

# Test 2: Test mode (bypass program pause)
echo "----------------------------------------"
echo "✅ Test 2: TEST MODE (with test=1)"
echo "Expected: Success"
echo "----------------------------------------"
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1" \
  -H "Content-Type: application/json" \
  -d "[{
    \"ma_kh_dms\":\"$MA_KH_DMS\",
    \"phone\":\"$PHONE\",
    \"document_id\":\"$DOCUMENT_ID\",
    \"watch_duration_seconds\":$WATCH_DURATION,
    \"time_rate\":$TIME_RATE,
    \"base_point\":$BASE_POINT,
    \"effective_point\":$EFFECTIVE_POINT,
    \"inserted_at\":\"$TIMESTAMP\"
  }]"

echo ""
echo ""

# Test 3: 60 giây = 0.5 time_rate
echo "----------------------------------------"
echo "📝 Test 3: 60 SECONDS (50% - time_rate=0.5)"
echo "Expected: Success with 2 effective points"
echo "----------------------------------------"
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1" \
  -H "Content-Type: application/json" \
  -d "[{
    \"ma_kh_dms\":\"$MA_KH_DMS\",
    \"phone\":\"$PHONE\",
    \"document_id\":\"13\",
    \"watch_duration_seconds\":60,
    \"time_rate\":0.5,
    \"base_point\":$BASE_POINT,
    \"effective_point\":2,
    \"inserted_at\":\"$TIMESTAMP\"
  }]"

echo ""
echo ""

# Test 4: 90 giây = 0.75 time_rate
echo "----------------------------------------"
echo "📝 Test 4: 90 SECONDS (75% - time_rate=0.75)"
echo "Expected: Success with 3 effective points"
echo "----------------------------------------"
curl -X POST "https://bi.meraplion.com/local/post_data/insert_nvbc_track_view/?test=1" \
  -H "Content-Type: application/json" \
  -d "[{
    \"ma_kh_dms\":\"$MA_KH_DMS\",
    \"phone\":\"$PHONE\",
    \"document_id\":\"14\",
    \"watch_duration_seconds\":90,
    \"time_rate\":0.75,
    \"base_point\":$BASE_POINT,
    \"effective_point\":3,
    \"inserted_at\":\"$TIMESTAMP\"
  }]"

echo ""
echo ""

echo "========================================"
echo "✅ ALL TESTS COMPLETED"
echo "========================================"

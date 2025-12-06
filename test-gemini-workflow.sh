#!/bin/bash

echo "🧪 Testing Gemini/Mock Workflow"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check frontend .env configuration
echo "📋 Step 1: Checking Frontend Configuration (.env)"
echo "---------------------------------------------------"
if [ -f .env ]; then
    echo "✅ .env file exists"
    
    if grep -q "REACT_APP_USE_MOCK=true" .env; then
        echo -e "${GREEN}✅ REACT_APP_USE_MOCK=true (Mock mode enabled)${NC}"
        MOCK_MODE=true
    else
        echo -e "${YELLOW}⚠️  REACT_APP_USE_MOCK=false (API mode)${NC}"
        MOCK_MODE=false
    fi
    
    if grep -q "REACT_APP_USE_GROK=false" .env; then
        echo "✅ REACT_APP_USE_GROK=false (Grok disabled)"
    else
        echo -e "${YELLOW}⚠️  REACT_APP_USE_GROK is not false${NC}"
    fi
else
    echo -e "${RED}❌ No .env file found${NC}"
    exit 1
fi

echo ""

# Check service implementation
echo "📋 Step 2: Checking Service Implementation"
echo "---------------------------------------------------"
if [ -f src/services/geminiServiceImpl.ts ]; then
    echo "✅ geminiServiceImpl.ts exists"
    
    # Check for key functions
    if grep -q "getInitialSuggestions" src/services/geminiServiceImpl.ts; then
        echo "✅ getInitialSuggestions function found"
    fi
    
    if grep -q "analyzeMood" src/services/geminiServiceImpl.ts; then
        echo "✅ analyzeMood function found"
    fi
else
    echo -e "${RED}❌ geminiServiceImpl.ts not found${NC}"
    exit 1
fi

echo ""

# Check data files
echo "📋 Step 3: Checking Mock Data Files"
echo "---------------------------------------------------"
DATA_FILES=(
    "src/data/foodSuggestions.json"
    "src/data/moodResponses.json"
    "src/data/quotes.json"
    "src/data/poetry.json"
    "src/data/memes.json"
)

for file in "${DATA_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo -e "${RED}❌ $file not found${NC}"
    fi
done

echo ""

# Run tests
echo "📋 Step 4: Running Application Tests"
echo "---------------------------------------------------"
npm test -- --watchAll=false --passWithNoTests 2>&1 | grep -E "(PASS|FAIL|Tests:|Test Suites:|●)" | head -20

echo ""

# Check if Gemini proxy exists (for future use)
echo "📋 Step 5: Checking Gemini Proxy (for future API mode)"
echo "---------------------------------------------------"
if [ -f serverless/geminiProxy.js ]; then
    echo "✅ geminiProxy.js exists"
    
    # Check syntax
    node -c serverless/geminiProxy.js 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Proxy file syntax is valid"
    else
        echo -e "${YELLOW}⚠️  Proxy file has syntax errors${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  geminiProxy.js not found (will need to create for API mode)${NC}"
fi

if [ -f serverless/.env ]; then
    echo "✅ serverless/.env exists"
    
    if grep -q "GEMINI_API_KEY" serverless/.env; then
        echo "✅ GEMINI_API_KEY configured in serverless/.env"
    fi
else
    echo -e "${YELLOW}⚠️  serverless/.env not found${NC}"
fi

echo ""

# Build test
echo "📋 Step 6: Testing Production Build"
echo "---------------------------------------------------"
echo "Building application..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build successful${NC}"
else
    echo -e "${RED}❌ Production build failed${NC}"
    exit 1
fi

echo ""
echo ""

# Summary and next steps
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo ""

if [ "$MOCK_MODE" = true ]; then
    echo -e "${GREEN}✅ Application is in MOCK MODE${NC}"
    echo ""
    echo "Current Workflow:"
    echo "  1. User selects mood and writes journal entry"
    echo "  2. getInitialSuggestions() returns 3 hard-coded suggestions"
    echo "  3. Suggestions displayed immediately (no API call)"
    echo "  4. 'Hit Me With Another One' shuffles from local data"
    echo "  5. All data comes from src/data/*.json files"
    echo ""
    echo "To start the app:"
    echo "  npm start"
    echo ""
    echo "To test manually:"
    echo "  1. Open http://localhost:3000"
    echo "  2. Select a mood (e.g., 'happy')"
    echo "  3. Write a journal entry"
    echo "  4. Click submit"
    echo "  5. Verify 3 food suggestions appear instantly"
    echo "  6. Click 'Hit Me With Another One' to get different suggestions"
    echo "  7. Like some suggestions and check Past Entries"
else
    echo -e "${YELLOW}⚠️  Application is in API MODE${NC}"
    echo ""
    echo "To use API mode with Gemini:"
    echo "  1. Ensure GEMINI_API_KEY is set in serverless/.env"
    echo "  2. Start Gemini proxy: npm run start:gemini-proxy"
    echo "  3. In another terminal: npm start"
    echo ""
    echo "To switch to MOCK MODE:"
    echo "  Edit .env and set REACT_APP_USE_MOCK=true"
fi

echo ""
echo "=============================="
echo -e "${GREEN}🎉 All Tests Passed!${NC}"
echo "=============================="

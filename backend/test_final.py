#!/usr/bin/env python3
"""
Test script to verify the agent and WebSocket integration works correctly.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agents.main_agent import main_agent, clear_redis_session
from app.db.database import get_db

def test_agent_responses():
    """Test that the agent responds correctly to different types of questions."""
    
    # Get database session
    db = next(get_db())
    
    # Test parameters
    user_id = "test_user_456"
    session_id = "test_session_789"
    
    try:
        # Clear any existing Redis history for this test session
        clear_redis_session(user_id, session_id)
        
        # Test different types of questions
        test_cases = [
            {
                "question": "hola",
                "expected_keywords": ["hola", "ayudarte", "3301"],
                "description": "Greeting"
            },
            {
                "question": "quien es colon?",
                "expected_keywords": ["colón", "cristóbal", "explorador", "américa", "3301"],
                "description": "Question about Colón"
            },
            {
                "question": "quien es alan turing?",
                "expected_keywords": ["turing", "alan", "computación", "matemático", "3301"],
                "description": "Question about Alan Turing"
            },
            {
                "question": "como funciona la fotosintesis?",
                "expected_keywords": ["fotosíntesis", "plantas", "luz", "dióxido", "3301"],
                "description": "Question about photosynthesis"
            }
        ]
        
        print("🧪 Testing Agent Responses")
        print("=" * 60)
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n{i}. {test_case['description']}")
            print(f"Question: '{test_case['question']}'")
            print("-" * 40)
            
            response = main_agent(test_case['question'], session_id, user_id, db)
            
            print(f"Response: '{response}'")
            
            # Check if response is a string (not a dict)
            if isinstance(response, str):
                print("✅ Response is a string (correct format)")
            else:
                print(f"❌ Response is not a string: {type(response)}")
                
            # Check if response ends with "3301"
            if response.strip().endswith("3301"):
                print("✅ Response ends with '3301'")
            else:
                print("❌ Response does NOT end with '3301'")
                
            # Check for expected keywords
            response_lower = response.lower()
            found_keywords = []
            missing_keywords = []
            
            for keyword in test_case['expected_keywords']:
                if keyword.lower() in response_lower:
                    found_keywords.append(keyword)
                else:
                    missing_keywords.append(keyword)
                    
            if found_keywords:
                print(f"✅ Found keywords: {found_keywords}")
            if missing_keywords:
                print(f"⚠️  Missing keywords: {missing_keywords}")
                
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    test_agent_responses()

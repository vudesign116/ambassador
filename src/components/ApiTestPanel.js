import React, { useState } from 'react';
import { Card, Button, Input, message, Alert, Space, Typography, Divider } from 'antd';
import { ApiOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

/**
 * API Test Panel - Test reward API với nhiều options
 * Để debug 401 error
 */
const ApiTestPanel = () => {
  const [endpoint, setEndpoint] = useState(
    localStorage.getItem('app_reward_api_endpoint') || 
    'https://bi.meraplion.com/local/post_data/insert_nvbc_reward_item/'
  );
  const [testPhone, setTestPhone] = useState(localStorage.getItem('phoneNumber') || '0982628847');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const addResult = (test, status, details) => {
    setResults(prev => [...prev, { test, status, details, time: new Date().toLocaleTimeString() }]);
  };

  const testAPI = async () => {
    setTesting(true);
    setResults([]);
    
    // API expects ARRAY of objects
    const payload = [{
      phone: testPhone,
      value: 'Test Monthly Gift',
      value1: 'Test DGCC Gift',
      value2: 'Test CGSP Gift',
      inserted_at: new Date().toISOString()
    }];

    const token = localStorage.getItem('authToken');

    // Test 1: Without auth (array format)
    try {
      addResult('Test 1: POST without auth (array)', 'running', 'Sending...');
      
      const response1 = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });
      
      const text1 = await response1.text();
      
      if (response1.ok) {
        addResult('Test 1: POST without auth (array)', 'success', `Status: ${response1.status}, Response: ${text1}`);
        message.success('✅ Test 1 SUCCESS - API không cần auth!');
      } else {
        addResult('Test 1: POST without auth (array)', 'error', `Status: ${response1.status}, Response: ${text1}`);
      }
    } catch (error) {
      addResult('Test 1: POST without auth (array)', 'error', error.message);
    }

    // Test 2: With Bearer token (array format)
    try {
      addResult('Test 2: POST with Bearer token (array)', 'running', 'Sending...');
      
      const response2 = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });
      
      const text2 = await response2.text();
      
      if (response2.ok) {
        addResult('Test 2: POST with Bearer token (array)', 'success', `Status: ${response2.status}, Response: ${text2}`);
        message.success('✅ Test 2 SUCCESS - Bearer token works!');
      } else {
        addResult('Test 2: POST with Bearer token (array)', 'error', `Status: ${response2.status}, Response: ${text2}`);
      }
    } catch (error) {
      addResult('Test 2: POST with Bearer token (array)', 'error', error.message);
    }

    // Test 3: With FormData
    try {
      addResult('Test 3: POST with FormData', 'running', 'Sending...');
      
      const formData = new FormData();
      formData.append('phone', testPhone);
      formData.append('value', 'Test Monthly Gift');
      formData.append('value1', 'Test DGCC Gift');
      formData.append('value2', 'Test CGSP Gift');
      formData.append('inserted_at', new Date().toISOString());
      
      const response3 = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      
      const text3 = await response3.text();
      
      if (response3.ok) {
        addResult('Test 3: POST with FormData', 'success', `Status: ${response3.status}, Response: ${text3}`);
        message.success('✅ Test 3 SUCCESS - FormData works!');
      } else {
        addResult('Test 3: POST with FormData', 'error', `Status: ${response3.status}, Response: ${text3}`);
      }
    } catch (error) {
      addResult('Test 3: POST with FormData', 'error', error.message);
    }

    // Test 4: GET request
    try {
      addResult('Test 4: GET request', 'running', 'Checking...');
      
      const response4 = await fetch(endpoint, {
        method: 'GET',
        mode: 'cors'
      });
      
      const text4 = await response4.text();
      addResult('Test 4: GET request', response4.ok ? 'success' : 'warning', `Status: ${response4.status}, Response: ${text4}`);
    } catch (error) {
      addResult('Test 4: GET request', 'error', error.message);
    }

    setTesting(false);
    message.info('All tests completed. Check results below.');
  };

  return (
    <Card 
      title={
        <Space>
          <ApiOutlined />
          <span>API Test Panel - Debug 401 Error</span>
        </Space>
      }
      style={{ marginTop: 24 }}
    >
      <Alert
        message="⚠️ Test Tool - For debugging only"
        description="Công cụ này giúp test API với nhiều cấu hình khác nhau để tìm cách gọi đúng"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>API Endpoint:</Text>
          <Input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://..."
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text strong>Test Phone:</Text>
          <Input
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="0982628847"
            style={{ marginTop: 8 }}
          />
        </div>

        <div>
          <Text strong>Token Status:</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              {localStorage.getItem('authToken') ? '✅ Token present' : '❌ Token missing'}
            </Text>
          </div>
        </div>

        <Button
          type="primary"
          icon={<ApiOutlined />}
          loading={testing}
          onClick={testAPI}
          size="large"
          block
        >
          {testing ? 'Testing...' : 'Run All Tests'}
        </Button>
      </Space>

      {results.length > 0 && (
        <>
          <Divider>Test Results</Divider>
          
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {results.map((result, index) => (
              <Card
                key={index}
                size="small"
                type={result.status === 'success' ? 'inner' : undefined}
                style={{
                  borderColor: result.status === 'success' ? '#52c41a' : 
                               result.status === 'error' ? '#ff4d4f' : '#d9d9d9'
                }}
              >
                <Space>
                  {result.status === 'success' && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  {result.status === 'error' && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  <Text strong>{result.test}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>({result.time})</Text>
                </Space>
                <Paragraph 
                  style={{ 
                    marginTop: 8, 
                    marginBottom: 0,
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap'
                  }}
                  type="secondary"
                >
                  {result.details}
                </Paragraph>
              </Card>
            ))}
          </Space>
        </>
      )}

      <Divider />

      <Alert
        message="💡 Debugging Tips"
        description={
          <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li>Nếu Test 1 SUCCESS → API không cần auth (remove Authorization header)</li>
            <li>Nếu Test 2 SUCCESS → API cần Bearer token</li>
            <li>Nếu Test 3 SUCCESS → API cần FormData thay vì JSON</li>
            <li>Nếu tất cả FAIL → Check CORS hoặc contact backend team</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default ApiTestPanel;

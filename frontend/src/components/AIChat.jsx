import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react'

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI business analyst. I have access to ALL your petrol station data including daily sales, procurement records, tank levels, and financial information. \n\n🌐 **Now with Google Sheets Integration**: Your data is automatically synced to Google Drive in real-time, and I can access it from there for faster and more accurate responses!\n\nAsk me anything about your business!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState('')
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [useGoogleSheets, setUseGoogleSheets] = useState(true)
  const [googleSheetsStatus, setGoogleSheetsStatus] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchDailyInsights()
    checkGoogleSheetsStatus()
  }, [])

  const checkGoogleSheetsStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/google-sheets/status')
      const data = await response.json()
      setGoogleSheetsStatus(data)
      
      // Auto-enable Google Sheets if available
      if (data.available && data.ai_chat_initialized) {
        setUseGoogleSheets(true)
      } else {
        setUseGoogleSheets(false)
      }
    } catch (error) {
      console.error('Failed to check Google Sheets status:', error)
      setUseGoogleSheets(false)
    }
  }

  const fetchDailyInsights = async () => {
    try {
      setLoadingInsights(true)
      const response = await fetch('http://localhost:5000/api/ai/insights')
      const result = await response.json()
      
      if (result.success) {
        setInsights(result.insights)
      } else {
        // Display error message as insights with more details
        setInsights(`### ⚠️ Error Retrieving Business Insights

**What happened**: ${result.error || "An unknown error occurred while generating insights."} 

**Possible causes**:
- OpenAI API key configuration issue
- Network connectivity problem
- Rate limit exceeded

**Solutions**:
1. Check that the API key is correctly set in the backend
2. Ensure the backend server can connect to the internet
3. Check server logs for detailed error messages

If the issue persists, please contact technical support.`)
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      setInsights(`### ⚠️ Connection Error

**What happened**: Could not connect to the AI service.

**Possible causes**:
- Backend server not running
- Network connectivity issue
- Backend server crashed or is unresponsive

**Solutions**:
1. Make sure the backend server is running
2. Check your network connection
3. Check the command prompt/terminal where you started the backend server for any error messages
4. Try restarting the backend server using the run_backend.bat file

If the issue persists, please contact technical support.`)
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleSendMessage = async (e, presetMessage = null) => {
    e.preventDefault()
    
    // Use either the preset message from quick access buttons or the input field
    const messageContent = presetMessage || inputMessage.trim()
    
    if (!messageContent || loading) return

    const userMessage = {
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    // Only clear input if we're using the input field (not preset messages)
    if (!presetMessage) {
      setInputMessage('')
    }
    
    setLoading(true)
    const messageToSend = messageContent;
    
    try {
      // Choose endpoint based on Google Sheets availability and user preference
      let endpoint;
      let dataSource = 'Local Database';
      
      if (useGoogleSheets && googleSheetsStatus?.available && googleSheetsStatus?.ai_chat_initialized) {
        endpoint = 'http://localhost:5000/api/google-sheets/ai-chat';
        dataSource = 'Google Sheets (Real-time)';
      } else if (advancedMode) {
        endpoint = 'http://localhost:5000/api/ai/advanced_chat';
        dataSource = 'Local Database (Advanced)';
      } else {
        endpoint = 'http://localhost:5000/api/ai/chat';
        dataSource = 'Local Database';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      })

      const result = await response.json()
      
      if (result.success || result.response) {
        const aiMessage = {
          type: 'ai',
          content: result.response || result.choices?.[0]?.message?.content,
          timestamp: new Date(),
          mode: advancedMode ? 'advanced' : 'standard',
          dataSource: dataSource,
          spreadsheetUrl: result.spreadsheet_url
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        // Display the specific error message from the API if available
        const errorContent = result.error 
          ? `Sorry, I'm having trouble connecting to the AI service. ${result.error}`
          : 'Sorry, I encountered an error while processing your request. Please try again.';
          
        const errorMessage = {
          type: 'ai',
          content: errorContent,
          timestamp: new Date(),
          dataSource: dataSource
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error communicating with AI service:", error);
      const errorMessage = {
        type: 'ai',
        content: `Sorry, I'm having trouble connecting to the AI service. 

**Possible causes**:
- Backend server is not running
- OpenAI API key is not configured correctly
- Network connectivity issue

Please check that the backend server is running and check the server logs for more details.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    "How much profit did I make this week?",
    "Should I buy more diesel now?",
    "Which manager performs better?",
    "What's my average daily sales?",
    "How long will my current stock last?",
    "Show me my variance trends"
  ]

  const handleQuickQuestion = (question) => {
    setInputMessage(question)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">AI Business Chat</h2>
        <Badge className="bg-green-100 text-green-800">
          <Brain className="h-4 w-4 mr-1" />
          Connected to ALL Data
        </Badge>
      </div>

      {/* Data Source Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Button
                  variant={useGoogleSheets ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseGoogleSheets(true)}
                  disabled={!googleSheetsStatus?.available}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  Google Sheets
                  {googleSheetsStatus?.available && <Badge variant="secondary" className="ml-1 text-xs">Live</Badge>}
                </Button>
                
                <Button
                  variant={!useGoogleSheets ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseGoogleSheets(false)}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Local Database
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {useGoogleSheets && googleSheetsStatus?.available ? (
                  <span className="text-green-600">✅ Using real-time Google Sheets data from hemanth.gajjala88@gmail.com</span>
                ) : useGoogleSheets && !googleSheetsStatus?.available ? (
                  <span className="text-yellow-600">⚠️ Google Sheets not available, using local database</span>
                ) : (
                  <span>Using local SQLite database</span>
                )}
              </div>
            </div>
            
            {googleSheetsStatus?.spreadsheet_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(googleSheetsStatus.spreadsheet_url, '_blank')}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                </svg>
                View Sheets
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            AI Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2">Analyzing your business data...</span>
            </div>
          ) : insights ? (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 markdown-content">{insights}</div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Add some data to get AI insights about your business.</p>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={fetchDailyInsights}
              variant="outline"
              size="sm"
              disabled={loadingInsights}
            >
              Refresh All Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Intelligence Quick Access */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Business Intelligence Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-blue-100 hover:border-blue-300 hover:bg-blue-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "How many days of stock (MS, HSD, POWER) do I have left based on current sales rate?")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Stock Depletion Forecast</span>
                <span className="text-xs text-gray-500 mt-1">When will we run out of each fuel type?</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-green-100 hover:border-green-300 hover:bg-green-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "When should I place the next order for MS, HSD, and POWER to avoid dry out?")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Optimal Refill Suggestion</span>
                <span className="text-xs text-gray-500 mt-1">When to order next for best timing</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-red-100 hover:border-red-300 hover:bg-red-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "Based on current profit and cash inflow, how many days till I can pay back HPCL credit?")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Credit Payback Timeline</span>
                <span className="text-xs text-gray-500 mt-1">When can we clear HPCL credit?</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-purple-100 hover:border-purple-300 hover:bg-purple-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "How much money is currently sitting in stock (cash value of current inventory)?")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Stock-to-Cash Conversion</span>
                <span className="text-xs text-gray-500 mt-1">Current inventory value in rupees</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-amber-100 hover:border-amber-300 hover:bg-amber-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "Which days and shifts are consistently high-selling? Show me sales patterns.")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Top Sales Days & Shifts</span>
                <span className="text-xs text-gray-500 mt-1">Identify peak sales periods</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-orange-100 hover:border-orange-300 hover:bg-orange-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "Was there an unusual drop or spike in sales or collections recently? Check for anomalies.")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Anomaly Detection</span>
                <span className="text-xs text-gray-500 mt-1">Find unusual patterns or issues</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-cyan-100 hover:border-cyan-300 hover:bg-cyan-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "What's the optimal refill amount for each tank to avoid dead stock or overflow?")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">Tank Fill Optimization</span>
                <span className="text-xs text-gray-500 mt-1">Best quantities to order</span>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto py-3 border-rose-100 hover:border-rose-300 hover:bg-rose-50" 
              onClick={() => handleSendMessage({ preventDefault: () => {} }, "Check for any cash collection anomalies - compare fuel sold vs money collected and explain in detail if there are discrepancies")}
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-medium text-rose-600">Cash Collection Verification</span>
                <span className="text-xs text-gray-500 mt-1">Audit sales vs collections (detailed)</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(question)}
                className="text-left justify-start h-auto py-2 px-3 whitespace-normal"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-500" />
            Chat with AI Analyst
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-blue-500" />
                    )}
                    {message.type === 'user' && (
                      <User className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
                    )}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 flex items-center justify-between ${
                        message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.type === 'ai' && message.dataSource && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {message.dataSource}
                            </Badge>
                            {message.spreadsheetUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-xs"
                                onClick={() => window.open(message.spreadsheetUrl, '_blank')}
                              >
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                                </svg>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">Processing your request...</span>
                      <span className="text-xs text-gray-500 mt-1">Analyzing business data and generating insights</span>
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your business data..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>What I Can Help You With</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Business Analysis
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sales trends and patterns</li>
                <li>• Profit/loss analysis</li>
                <li>• Manager performance comparison</li>
                <li>• Seasonal business insights</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                Operational Insights
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Stock management recommendations</li>
                <li>• Procurement timing optimization</li>
                <li>• Variance analysis and alerts</li>
                <li>• Tank duration predictions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AIChat


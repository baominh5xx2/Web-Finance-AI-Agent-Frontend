# 🚀 Finance AI Agent - Advanced Financial Dashboard

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3.js)
![React PDF](https://img.shields.io/badge/React_PDF-FF6B6B?style=for-the-badge&logo=adobe-acrobat-reader)

*A cutting-edge financial analytics platform powered by AI for intelligent market analysis*

</div>

## ✨ Overview

The **Finance AI Agent** is a sophisticated web application built with Next.js 14, TypeScript, and modern web technologies. It provides real-time financial market analysis, interactive data visualizations, and AI-powered insights for Vietnamese stock markets including VN-Index, HNX, UPCOM, VN30, and HNX30.

## 🌟 Key Features

### 📊 **Comprehensive Dashboard**
- Real-time market indices tracking with live updates
- Interactive market statistics and performance analytics
- Responsive design optimized for desktop and mobile devices

### 💹 **Advanced Market Analysis**
- **Dynamic TreeMap Visualization**: Interactive D3.js-powered treemap showing stock performance by market capitalization and sector distribution
- **Market Statistics**: Detailed charts and graphs powered by [`MarketStatistics.tsx`](src/components/market-watch/MarketStatistics.tsx)
- **Smart Trade Recommendations**: AI-driven trading suggestions via [`SmartTradeRecommendations.tsx`](src/components/smart-trade/SmartTradeRecommendations.tsx)

### 🤖 **AI-Powered Features**
- **Intelligent Chatbot**: Financial assistant for market queries and support ([`chatbot.tsx`](src/components/chatbot/chatbot.tsx))
- **Smart Analytics**: Automated market analysis and trend detection
- **Real-time Data Processing**: Efficient caching and API optimization

### 📈 **Market Data & Insights**
- **Multi-Index Support**: VN-Index, HNX, UPCOM, VN30, HNX30 tracking
- **Stock News Integration**: Latest financial news via [`StockNews.tsx`](src/components/stock-news/StockNews.tsx)
- **Investment Performance**: Portfolio tracking and performance analysis
- **PDF Report Generation**: Automated stock analysis reports (currently supporting NKG)

### ⚡ **Performance & Optimization**
- **Advanced Caching System**: Multi-layer caching with API routes ([`index-cache`](src/app/api/index-cache/) and [`index-data`](src/app/api/index-data/))
- **Server-Side Rendering**: Optimized with Next.js App Router
- **Error Handling**: Comprehensive error boundaries and 404 pages

## 🛠️ Technology Stack

### **Frontend Technologies**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + Material-UI (MUI)
- **Data Visualization**: D3.js for interactive charts
- **PDF Processing**: react-pdf for document handling and visualization

### **Development Tools**
- **Linting**: ESLint for code quality
- **Formatting**: Prettier for consistent code style
- **Build System**: Next.js with TypeScript configuration

## 🏗️ Project Architecture

```
📦 Web-Finance-AI-Agent-Frontend/
├── 📄 Configuration Files
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS setup
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json            # Dependencies and scripts
│
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 api/             # Backend API routes
│   │   │   ├── index-cache/    # Caching API endpoints
│   │   │   └── index-data/     # Data management APIs
│   │   ├── 📁 dashboard/       # Main dashboard page
│   │   ├── 📁 report/          # PDF report generation
│   │   ├── 📁 services/        # API service functions
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   │
│   ├── 📁 components/          # Reusable React components
│   │   ├── 📁 chatbot/         # AI chatbot interface
│   │   ├── 📁 market-watch/    # Market monitoring components
│   │   ├── 📁 StockTreeMap/    # Interactive treemap visualization
│   │   ├── 📁 smart-trade/     # Trading recommendations
│   │   ├── 📁 stock-news/      # Financial news display
│   │   └── ErrorBoundary.tsx   # Error handling component
│   │
│   ├── 📁 lib/                 # Utility libraries
│   │   ├── api.ts              # API helper functions
│   │   ├── utils.ts            # General utilities
│   │   └── websocket.ts        # Real-time data connections
│   │
│   └── 📁 utils/               # Additional utility functions
│       └── notFoundHelper.ts   # 404 page utilities
│
└── 📁 public/
    └── 📁 data/                # Static data files for caching
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.x or later
- npm, yarn, or pnpm package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/Web-Finance-AI-Agent-Frontend.git
   cd Web-Finance-AI-Agent-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment setup** (if applicable)
   ```bash
   # Create environment file if needed
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to view the application

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🎯 Key Components

### **Market Data Visualization**
- **[`StockTreeMap.tsx`](src/components/StockTreeMap/StockTreeMap.tsx)**: Interactive D3.js treemap for market overview
- **[`MarketIndices.tsx`](src/components/market-watch/MarketIndices.tsx)**: Real-time index tracking
- **[`MarketStatistics.tsx`](src/components/market-watch/MarketStatistics.tsx)**: Statistical analysis and charts

### **AI & Intelligence**
- **[`chatbot.tsx`](src/components/chatbot/chatbot.tsx)**: AI-powered financial assistant
- **[`SmartTradeRecommendations.tsx`](src/components/smart-trade/SmartTradeRecommendations.tsx)**: Intelligent trading suggestions

### **Data Management**
- **[`/api/index-data/[indexCode]/route.ts`](src/app/api/index-data/[indexCode]/route.ts)**: Dynamic data fetching
- **[`/api/index-cache/[indexCode]/route.ts`](src/app/api/index-cache/[indexCode]/route.ts)**: Intelligent caching system

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layouts for touch interaction
- **Mobile**: Streamlined interface for on-the-go access

## 🔧 API Integration

### **Supported Market Indices**
- **VNINDEX**: Vietnam's main stock index
- **HNXINDEX**: Hanoi Stock Exchange
- **UPCOMINDEX**: Unlisted Public Company Market
- **VN30**: Top 30 Vietnamese stocks
- **HNX30**: Top 30 HNX stocks

### **Data Sources**
- Real-time market data APIs
- Financial news feeds
- Historical price data
- Company fundamental data

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Code Standards**
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📊 Performance Features

- **Intelligent Caching**: Multi-layer caching system for optimal performance
- **Lazy Loading**: Components load on demand
- **Code Splitting**: Optimized bundle sizes
- **SEO Optimization**: Server-side rendering for better search rankings

## 🔐 Security & Error Handling

- **Error Boundaries**: Comprehensive error catching with [`ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx)
- **Custom 404 Pages**: User-friendly error pages
- **Type Safety**: Full TypeScript implementation
- **Input Validation**: Robust data validation

## 📈 Future Roadmap

- [ ] Advanced AI analytics and predictions
- [ ] Real-time portfolio tracking
- [ ] Additional market support (international markets)
- [ ] Enhanced reporting features
- [ ] WebSocket real-time updates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Next.js and TypeScript
- Data visualization powered by D3.js
- UI components from Material-UI
- Financial data integration and AI analytics

---

<div align="center">

**🚀 Navigate the financial markets with confidence and precision! 📈**

*Made with ❤️ for the Vietnamese financial community*

</div>
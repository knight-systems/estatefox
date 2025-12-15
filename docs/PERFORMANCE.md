# Performance Optimization Guide

## Overview

This document outlines performance optimizations implemented in the EstateFox application and best practices for maintaining optimal performance.

## Frontend Performance

### Build Optimizations

#### Asset Optimization
- ✅ **Images**: Compressed PNG assets in `/frontend/assets/`
  - `logo-full.png` - 25KB (full branding logo)
  - `logo-horizontal.png` - 40KB (horizontal layout)
  - `fox-icon.png` - 7.7KB (icon/favicon)
  - `favicon.ico` - 4.3KB (browser favicon)

#### Bundle Optimization
- Expo Metro bundler with tree-shaking
- Code splitting via Expo Router
- Lazy loading of routes
- Image assets optimized for web

### Caching Strategy

#### CloudFront/CDN (Configured in deployment)
```yaml
Static Assets (.js, .css, .png, .jpg):
  Cache-Control: public, max-age=31536000, immutable
  # 1 year cache - files are content-hashed

HTML Files (index.html):
  Cache-Control: public, max-age=0, must-revalidate
  # Always revalidate to get latest app shell

JSON Files (manifest, API responses):
  Cache-Control: public, max-age=0, must-revalidate
  # Dynamic content, always check for updates
```

#### React Query Caching
Configured in `app/_layout.tsx`:
```typescript
- staleTime: 30 seconds - Data fresh for 30s
- gcTime: 5 minutes - Cache cleanup after 5m
- retry: 2 attempts - Automatic retry on failure
```

### Network Optimization

#### API Client Configuration
Located in `services/api.ts`:
- HTTP/2 multiplexing via CloudFront
- Automatic retry with exponential backoff
- Request deduplication via React Query
- Optimistic updates for mutations

#### Lazy Loading
- Routes lazy loaded via Expo Router
- Images lazy loaded with native loading="lazy"
- Components code-split automatically

### Rendering Performance

#### React Optimizations
- Functional components with hooks
- Memoization where appropriate
- Virtual lists for long scrolling content (if needed)
- Debounced search inputs

#### Mobile Performance
- Native components via React Native
- 60 FPS animations
- Hardware acceleration
- Reduced motion support

### SEO Optimizations

#### Meta Tags (in `app/_layout.tsx`)
```tsx
- Title: "EstateFox - South Florida Real Estate"
- Description: Search-optimized property listing description
- Keywords: Real estate, South Florida, Miami, properties
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URL for duplicate content prevention
```

#### PWA Features (in `app.json`)
```json
- Theme color: #17425a (brand navy)
- App name and short name
- Icons and splash screens
- Offline support (via service worker)
- Install prompt for mobile
```

#### Accessibility
- Semantic HTML via Expo web
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

## Backend Performance

### API Optimization

#### FastAPI Performance Features
- Async/await for non-blocking I/O
- Pydantic validation with minimal overhead
- Automatic OpenAPI schema generation
- CORS configured for production

#### Lambda Performance
```python
Cold Start Optimization:
- Minimal dependencies in container
- Pre-compiled Python bytecode
- Connection pooling for databases
- Environment variables for config

Warm Execution:
- Response time: <100ms typical
- Concurrent executions scale automatically
- VPC networking if needed for RDS
```

### Database Optimization (when implemented)
- Connection pooling
- Query optimization with indexes
- Read replicas for scaling
- Caching layer (Redis/ElastiCache)

## Performance Monitoring

### Frontend Metrics

#### Core Web Vitals
Target metrics:
```
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
```

#### Monitoring Tools
- Chrome DevTools Performance tab
- Lighthouse CI in GitHub Actions
- Real User Monitoring (RUM) - CloudWatch RUM
- Web Vitals API in production

### Backend Metrics

#### Lambda Metrics (CloudWatch)
```
Invocation count
Duration (P50, P95, P99)
Error rate
Throttles
Cold starts
Concurrent executions
```

#### API Gateway Metrics (if used)
```
Request count
4XX/5XX errors
Latency
Cache hit rate
```

### Performance Budget

#### Bundle Size Targets
```
Initial JS bundle: < 300KB (gzipped)
Initial CSS: < 50KB (gzipped)
Critical images: < 100KB total
Time to Interactive: < 3.5s on 3G
```

#### API Response Times
```
Health check: < 50ms
GET requests: < 200ms
POST requests: < 500ms
Complex queries: < 1s
```

## Performance Testing

### Frontend Testing

#### Load Time Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.json

# WebPageTest
# Visit https://www.webpagetest.org/
# Enter URL and test from multiple locations
```

#### Bundle Analysis
```bash
cd frontend
npm run build:web

# Analyze bundle size
npx expo-optimize
npx source-map-explorer dist/**/*.js
```

### Backend Testing

#### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://api.estatefox.com/health

# Or use locust
pip install locust
locust -f tests/load/locustfile.py
```

#### Profiling
```python
# Add cProfile for Python profiling
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()

# Your code here

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)
```

## Optimization Checklist

### Pre-Launch Checklist
- [x] Images optimized and compressed
- [x] Meta tags for SEO implemented
- [x] PWA manifest configured
- [x] Caching headers configured
- [x] CDN/CloudFront enabled
- [ ] Service worker for offline support
- [ ] Lighthouse score > 90
- [ ] Bundle size within budget
- [ ] API response times measured
- [ ] Error tracking configured (Sentry/Rollbar)

### Ongoing Optimization
- [ ] Monitor Core Web Vitals monthly
- [ ] Review bundle size on each release
- [ ] Profile slow API endpoints
- [ ] Update dependencies quarterly
- [ ] Review CloudWatch metrics weekly
- [ ] Test on real mobile devices
- [ ] Run Lighthouse CI on PRs
- [ ] Monitor error rates

## Common Performance Issues

### Issue: Slow Initial Load
**Solutions**:
- Reduce bundle size (code splitting)
- Optimize images (WebP, compression)
- Enable CDN caching
- Preload critical resources
- Remove unused dependencies

### Issue: Slow API Responses
**Solutions**:
- Add database indexes
- Implement caching (Redis)
- Optimize queries (N+1 problem)
- Use Lambda provisioned concurrency
- Add read replicas

### Issue: High Cold Start Times (Lambda)
**Solutions**:
- Reduce container size
- Use Lambda SnapStart
- Keep functions warm with CloudWatch Events
- Split large functions
- Use provisioned concurrency for critical paths

### Issue: Memory Leaks (Frontend)
**Solutions**:
- Clean up event listeners
- Unsubscribe from subscriptions
- Use React Query for data fetching
- Profile with Chrome DevTools Memory
- Check for circular references

## Future Optimizations

### Planned Improvements
1. **Service Worker**: Offline support and background sync
2. **Image Optimization**: WebP with PNG fallback
3. **Font Optimization**: Self-hosted fonts with preload
4. **Critical CSS**: Inline critical CSS in HTML
5. **Prefetching**: Prefetch likely navigation targets
6. **GraphQL**: Reduce over-fetching with GraphQL API
7. **Edge Functions**: Move auth/validation to CloudFront@Edge
8. **Brotli Compression**: Enable for CloudFront
9. **HTTP/3**: Enable when widely supported
10. **Progressive Image Loading**: Blur placeholder → full image

### Advanced Optimizations
- Server-side rendering (SSR) for SEO-critical pages
- Static site generation (SSG) for content pages
- Incremental static regeneration (ISR)
- Edge caching with CloudFlare/Fastly
- Database connection pooling with RDS Proxy
- Elasticsearch for property search
- Redis for session/rate limiting
- API versioning for backward compatibility

## Tools & Resources

### Performance Tools
- **Lighthouse**: https://developers.google.com/web/tools/lighthouse
- **WebPageTest**: https://www.webpagetest.org/
- **Chrome DevTools**: Built into Chrome browser
- **React DevTools Profiler**: Chrome extension
- **Bundle Analyzer**: npm package for Webpack/Metro

### Documentation
- **Web Vitals**: https://web.dev/vitals/
- **Expo Performance**: https://docs.expo.dev/guides/performance/
- **React Native Performance**: https://reactnative.dev/docs/performance
- **FastAPI Performance**: https://fastapi.tiangolo.com/deployment/concepts/
- **AWS Lambda Performance**: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html

### Monitoring Services
- **CloudWatch**: AWS native monitoring
- **Datadog**: Full-stack monitoring
- **New Relic**: APM and RUM
- **Sentry**: Error tracking and performance
- **LogRocket**: Session replay and monitoring

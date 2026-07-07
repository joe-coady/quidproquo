import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Packages } from './components/Packages';
import { Pipeline } from './components/Pipeline';
import { YieldLoop } from './components/YieldLoop';

function App() {
  return (
    <main>
      <Hero />
      <Features />
      <YieldLoop />
      <Pipeline />
      <Packages />
      <Footer />
    </main>
  );
}

export default App;

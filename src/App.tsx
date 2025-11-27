import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      
      <div className="app-container">
        <h1>Welcome to Ono's Candidates Site</h1>
        <p>Here you can find important information about the admission process.</p>
      </div>

      <Footer />
    </>
  );
}

export default App;
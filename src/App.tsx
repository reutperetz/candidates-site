import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app-container">
      <Header />

      <h1>Welcome to Ono's Candidates Site</h1>
      <p>This is the candidates portal for the Computer Science Department.</p>

      <Footer />
    </div>
  );
}

export default App;
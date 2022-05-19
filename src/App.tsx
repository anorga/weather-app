import React, {useState} from 'react';
import './App.css';

function App() {
  const [locationSearch, setLocationSearch] = useState('Paris');
  const [locations, setLocations] = useState(['Belfast', 'Dublin']);
  return (
    <div>
      <h1>Weather App</h1>

      <div>
        <label>
          Add Location
          <input type="text" value={locationSearch} onChange= {e => setLocationSearch(e.target.value)} />
        </label>
      </div>

<div>
  <h2>Locations</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
      </tr>
    </thead>
    <tbody>
      {locations.map((location, index )=> 
        <tr key={index}><td>{location}</td></tr>)}
    </tbody>
  </table>
</div>



    </div>
  );
}

export default App;

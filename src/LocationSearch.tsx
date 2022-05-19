import React from "react";
import {FC, useState} from "react";

interface LocationSearchProps {
    onSearch: (search: string) => void;
}

export const LocationSearch: FC<LocationSearchProps> = ({onSearch}) => {
    const [locationSearch, setLocationSearch] = useState('');
    const disableSearch = locationSearch.trim() === '';

    const addLocation = () => {
        onSearch(locationSearch);
        setLocationSearch('');
    }

    return(
    <div>
        <label>
          Add Location
          <input className="weatherinput" type="text" value={locationSearch} onChange={e => setLocationSearch(e.target.value)} />
        </label>
        <button className="btn btn-primary" onClick={addLocation} disabled={disableSearch}>Search</button>
      </div>
)}
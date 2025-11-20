import React, { useState, useEffect } from 'react';

function LinkList() {
    // State for the list of links (same as before)
    const [links, setLinks] = useState(() => {
        const savedLinks = localStorage.getItem("links");
        return savedLinks ? JSON.parse(savedLinks) : [];
    });

    // State for the input fields (same as before)
    const [newLinkName, setNewLinkName] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    
    // NEW: State to control the visibility of the input form
    const [showForm, setShowForm] = useState(false);

    // useEffect hook to persist the links array to localStorage (same as before)
    useEffect(() => {
        localStorage.setItem("links", JSON.stringify(links));
    }, [links]);

    // --- Event Handlers ---

    function handleNameChange(event) {
        setNewLinkName(event.target.value);
    }

    function handleUrlChange(event) {
        setNewLinkUrl(event.target.value);
    }

    function toggleForm() {
        // Toggles the state between true and false
        setShowForm(prevShowForm => !prevShowForm);
    }

    function addLink() {
        const trimmedName = newLinkName.trim();
        const trimmedUrl = newLinkUrl.trim();

        if (trimmedName !== "" && trimmedUrl !== "") {
            const completeUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') 
                                ? trimmedUrl 
                                : `https://${trimmedUrl}`;

            const newLink = {
                name: trimmedName,
                url: completeUrl
            };

            setLinks(l => [...l, newLink]);

            // Clear the input fields and hide the form after adding
            setNewLinkName("");
            setNewLinkUrl("");
            setShowForm(false); // Hide the form after successful addition
        }
    }

    function deleteLink(index) {
        const updatedLinks = links.filter((_, i) => i !== index);
        setLinks(updatedLinks);
    }
    
    // --- Component JSX Render ---
    return (
        <div className="w-full">

            {/* NEW: Button to Toggle the Input Form */}
            <div className='p-3'>
                <button
                    className="blue-box p-2 rounded bg-green-500 hover:bg-green-600 transition duration-150 cursor-pointer"
                    onClick={toggleForm}>
                    {/* Change button text based on form state */}
                    {showForm ? 'Cancel' : '+ New'}
                </button>
            </div>

            {/* NEW: Conditional Rendering */}
            {showForm && (
                <div className='p-3 flex flex-col space-y-2 pt-4 mt-2'>
                    {/* Input for Link Name */}
                    <input
                        type="text"
                        placeholder="Display Name (e.g., Google)"
                        className='p-2 rounded'
                        value={newLinkName}
                        onChange={handleNameChange}
                    />
                    {/* Input for Link URL */}
                    <input
                        type="url"
                        placeholder="URL (e.g., google.com)"
                        className='p-2 rounded'
                        value={newLinkUrl}
                        onChange={handleUrlChange}
                    />
                    <button
                        className="cursor-pointer blue-box p-2 rounded bg-blue-500 hover:bg-blue-600 transition duration-150"
                        onClick={addLink}>
                        Confirm Link
                    </button>
                </div>
            )}

            <ul className="w-full p-3 space-y-3 text-lg">
                {links.map((linkItem, index) =>
                    <li key={index} className="flex items-center justify-between p-2">
                        {/* Link Display and Actual Anchor Tag */}
                        <a 
                           href={linkItem.url} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="cursor-pointer">
                            {linkItem.name} 
                            <span className="text-sm text-gray-400 ml-2">
                                ({linkItem.url.replace(/^https?:\/\//, '').replace(/\/$/, '')})
                            </span>
                        </a>
                        
                        {/* Delete Button */}
                        <button
                            className='p-1 transition duration-150 cursor-pointer'
                            onClick={() => deleteLink(index)}>
                            🗑
                        </button>
                    </li>
                )}
                {links.length === 0 && (
                    <p className="text-gray-500 text-center italic">No links added yet. Click 'Add New Link' to begin!</p>
                )}
            </ul>
        </div>
    )
}

export default LinkList;
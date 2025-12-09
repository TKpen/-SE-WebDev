import React, { useState, useEffect } from 'react';

function LinkList() {
    const [links, setLinks] = useState(() => {
        const savedLinks = localStorage.getItem("links");
        return savedLinks ? JSON.parse(savedLinks).map(link => ({
            name: link.name,
            url: link.url,
            iconUrl: link.iconUrl || ''
        })) : [];
    });

    const [newLinkName, setNewLinkName] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [globalMenuOpen, setGlobalMenuOpen] = useState(false); 
    const [managementMode, setManagementMode] = useState(false); 

    useEffect(() => {
        localStorage.setItem("links", JSON.stringify(links));
    }, [links]);

    function getDomain(url) {
        try {
            const urlObject = new URL(url);
            return urlObject.hostname;
        } catch (e) {
            return null;
        }
    }

    function handleNameChange(event) {
        setNewLinkName(event.target.value);
    }

    function handleUrlChange(event) {
        setNewLinkUrl(event.target.value);
    }

    function toggleForm() {
        setEditingIndex(null); 
        setManagementMode(false); 
        setGlobalMenuOpen(false); 
        setShowForm(prevShowForm => !prevShowForm);
        
        if (showForm) {
            setNewLinkName("");
            setNewLinkUrl("");
        }
    }

    function toggleManagementMode() {
        setEditingIndex(null); 
        setShowForm(false);
        setGlobalMenuOpen(false); 
        setManagementMode(prevMode => !prevMode);
    }

    function addLink() {
        const trimmedName = newLinkName.trim();
        const trimmedUrl = newLinkUrl.trim();
        let iconUrlToUse = '';

        if (trimmedName !== "" && trimmedUrl !== "") {
            const completeUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') 
                                ? trimmedUrl 
                                : `https://${trimmedUrl}`;

            const domain = getDomain(completeUrl);
            if (domain) {
                iconUrlToUse = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            }

            const newLink = { name: trimmedName, url: completeUrl, iconUrl: iconUrlToUse };
            setLinks(l => [...l, newLink]);
            setNewLinkName("");
            setNewLinkUrl("");
            setShowForm(false);
        }
    }

    function deleteLink(index) {
        const updatedLinks = links.filter((_, i) => i !== index);
        setLinks(updatedLinks);
        setEditingIndex(null);
    }

    function clearAllLinks() {
        if (window.confirm("Are you sure you want to delete all links? This action cannot be undone.")) {
            setLinks([]);
            setManagementMode(false);
            setGlobalMenuOpen(false);
        }
    }

    function startEdit(index) {
        setShowForm(false);
        setGlobalMenuOpen(false);
        setEditName(links[index].name);
        setEditUrl(links[index].url);
        setEditingIndex(index);
    }

    function cancelEdit() {
        setEditingIndex(null);
        setEditName("");
        setEditUrl("");
    }

    function saveEdit(index) {
        const trimmedName = editName.trim();
        const trimmedUrl = editUrl.trim();
        let iconUrlToUse = '';

        if (trimmedName !== "" && trimmedUrl !== "") {
            const updatedLinks = [...links];
            const completeUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') 
                                ? trimmedUrl 
                                : `https://${trimmedUrl}`;

            const domain = getDomain(completeUrl);
            if (domain) {
                iconUrlToUse = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            }

            updatedLinks[index] = {
                name: trimmedName,
                url: completeUrl,
                iconUrl: iconUrlToUse
            };

            setLinks(updatedLinks);
            cancelEdit();
        }
    }
    
    return (
        <div className="p-4 relative bg-gray-800 rounded-lg h-full text-gray-100"> 
            
            <div className="absolute top-4 right-4 z-20">
                <button 
                    onClick={() => setGlobalMenuOpen(prev => !prev)}
                    className='p-1 text-2xl text-gray-400 font-bold leading-none bg-gray-700 rounded-full hover:bg-gray-600 transition-colors shadow-lg'>
                    ⋮
                </button>
                
                {globalMenuOpen && (
                    <div className="absolute top-10 right-0 w-48 bg-gray-700 rounded-lg shadow-xl py-1 border border-gray-600 z-30">
                        <button 
                            onClick={toggleForm}
                            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center space-x-2">
                            {showForm ? 'Hide Add Form' : 'Add New Link'}
                        </button>
                        <hr className="my-1 border-gray-600"/>
                         <button 
                            onClick={toggleManagementMode}
                            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 flex items-center space-x-2">
                            {managementMode ? 'Done Managing' : 'Manage/Edit Links'}
                        </button>
                        <hr className="my-1 border-gray-600"/>
                        <button 
                            onClick={clearAllLinks}
                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900 flex items-center space-x-2">
                            Clear All Links
                        </button>
                    </div>
                )}
            </div>

            <h2 className="text-xl font-semibold text-gray-300 mb-6"></h2>

            {showForm && (
                <div className='p-4 mb-6 bg-gray-700 rounded-lg shadow-inner flex flex-col space-y-3'>
                    <input
                        type="text"
                        placeholder="Display Name (e.g., My DSU)"
                        className='p-3 rounded-md border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        value={newLinkName}
                        onChange={handleNameChange}
                    />
                    <input
                        type="url"
                        placeholder="Website URL (e.g., dsu.edu)"
                        className='p-3 rounded-md border border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 outline-none'
                        value={newLinkUrl}
                        onChange={handleUrlChange}
                    />
                    <button
                        onClick={addLink}
                        className="p-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-150 shadow-md">
                        Confirm Link
                    </button>
                </div>
            )}

            {links.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-4 gap-y-6 justify-items-center">
                    {links.map((linkItem, index) =>
                        editingIndex === index ? (
                            <div key={index} className="flex flex-col items-center p-2 bg-yellow-900 border border-yellow-700 rounded-lg w-full max-w-xs">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className='p-1 my-1 text-sm rounded w-full border border-yellow-600 bg-yellow-100 text-gray-900'
                                />
                                <input
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    className='p-1 my-1 text-xs rounded w-full border border-yellow-600 bg-yellow-100 text-gray-900'
                                />
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        onClick={() => saveEdit(index)}
                                        className='text-xs p-1 bg-green-600 text-white rounded hover:bg-green-700'>
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className='text-xs p-1 bg-gray-500 text-white rounded hover:bg-gray-600'>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div key={index} className="flex flex-col items-center group relative w-full max-w-xs">
                                
                                {managementMode && (
                                    <div className='absolute top-0 right-0 flex space-x-1 p-1 z-10'>
                                        <button
                                            className='bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition rounded-full text-xs p-1'
                                            onClick={() => startEdit(index)}>
                                            Edit
                                        </button>
                                        <button
                                            className='bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition rounded-full text-xs p-1'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                deleteLink(index);
                                            }}>
                                            🗑
                                        </button>
                                    </div>
                                )}

                                <a 
                                    href={linkItem.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-20 h-20 bg-gray-700 rounded-xl shadow-md flex items-center justify-center overflow-hidden 
                                            hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer p-1">
                                    {linkItem.iconUrl ? (
                                        <img 
                                            src={linkItem.iconUrl} 
                                            alt={linkItem.name} 
                                            className="w-full h-full object-contain rounded-lg"
                                            onError={(e) => { 
                                                e.currentTarget.src = 'https://via.placeholder.com/60?text=🚫'; 
                                                e.currentTarget.style.padding = '10px';
                                                e.currentTarget.style.backgroundColor = '#4b5563';
                                            }}
                                        />
                                    ) : (
                                        <span className="text-4xl text-blue-400">🔗</span>
                                    )}
                                </a>
                                
                                <p className="mt-2 text-sm text-gray-400 font-medium text-center max-w-[80px] truncate">{linkItem.name}</p>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <p className="text-gray-400 text-center italic mt-10">No links added yet. Use the ⋮ menu in the top right to start!</p>
            )}
        </div>
    )
}

export default LinkList;
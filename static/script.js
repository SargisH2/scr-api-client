async function submitRequest() {
    const inputFieldQuery = document.getElementById('inputFieldQuery').value;
    const inputFieldSupplier = document.getElementById('inputFieldSupplier').value;
    const inputFieldDepth = document.getElementById('inputFieldDepth').value;
    if (inputFieldQuery) {
        const response = await fetch('/start-process/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                    query: inputFieldQuery,
                    supplier: inputFieldSupplier,
                    depth: inputFieldDepth
                }),
        });

        if (response.ok) {
            const result = await response.json();
            // Save the response globally for downloading
            console.log(result)
            const queryId = result.query_id;
            pollForData(queryId); 
        } else {
            console.error('Failed to fetch');
        }
    }
}

function pollForData(queryId) {
    const intervalId = setInterval(async () => {
        const response = await fetch(`/data/${queryId}`);
        const data = await response.json();

        if (data.message !== "Data not available yet.") {
            clearInterval(intervalId);
            btn = document.getElementById('downloadBtn')
            btn.style.display = 'inline-block';
            btn.onclick = function() {
                downloadJSON(data, queryId);
            };
        }
    }, 2000); // Poll every 2 seconds
}

function downloadJSON(data, filename) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${filename}.json`);
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

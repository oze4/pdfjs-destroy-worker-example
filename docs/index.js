const url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
const renderButton = document.getElementById('rpdf');
const destroyButton = document.getElementById('rw');
const status = document.getElementById('status');
const statusCont = document.getElementById("stat-cont");
let loadingTasks = [];
var canvas = document.getElementById('the-canvas');

function createWorker() {
    let loadingTask = pdfjsLib.getDocument(url);
    loadingTasks.push(loadingTask);
    [renderButton, destroyButton].forEach(b => b.disabled = false);
    status.innerHTML +=
        "<li>Worker created! You should now see a worker in your browsers task manager, click 'Render PDF' " +
        "to render an image, or click 'Destroy Worker' to remove the worker</li>";
    scrollToBottomOfStatus();
}

function removeWorker() {
    loadingTasks.forEach(lt => {
        lt.destroy()
    });
    loadingTasks = [];
    clearCanvas();
    status.innerHTML +=
        "<li>Destroyed worker - the worker in your browsers task manager should now be removed " +
        "<b>NOTE: you may need to refresh your browsers task manager! (especially if you created multiple workers!!!)</b></li>";
    [renderButton, destroyButton].forEach(b => b.disabled = true);
    scrollToBottomOfStatus();
}

function renderPdf() {
    loadingTasks[0].promise.then((pdf) => {
        let pageNumber = 1;
        pdf.getPage(pageNumber).then((page) => {
            let scale = 1.5;
            let viewport = page.getViewport({
                scale: scale
            });
            let context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            let renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            let renderTask = page.render(renderContext).promise.then(() => {
                status.innerHTML += "<li>Rendered PDF</li>";
                scrollToBottomOfStatus();
            });
        });
    }, (reason) => {
        status.innerHTML +=
            "<li style='color:red;'>ERROR! Something went wrong! Check your console</li>";
        console.log(reason);
        scrollToBottomOfStatus();
    });
}

function clearCanvas() {
    document.body.removeChild(canvas);
    let canv = document.createElement('canvas');
    canv.id = 'the-canvas';
    canv.style.border = '1px solid black';
    canvas = canv;
    document.body.appendChild(canv);
    scrollToBottomOfStatus();
}

function scrollToBottomOfStatus() {
    statusCont.scrollTop = statusCont.scrollHeight;
}

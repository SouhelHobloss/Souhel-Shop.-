let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let totalMoney = Number(localStorage.getItem("totalMoney")) || 0;
let rate = Number(localStorage.getItem("rate")) || 90000;

showProducts();

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("sales", JSON.stringify(sales));
    localStorage.setItem("totalMoney", totalMoney);
}

function addProduct() {

    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const qty = Number(document.getElementById("qty").value);
    const currency = document.getElementById("currency").value;
    
    const imageInput = document.getElementById("image");

    if (name === "" || price <= 0 || qty <= 0) {
        alert("أدخل جميع البيانات");
        return;
    }

    products.push({
    id: Date.now(),
    name,
    price,
    qty,
    currency,
    image: imageInput.files[0]
        ? URL.createObjectURL(imageInput.files[0])
        : ""
});

    saveProducts();

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("qty").value = "";
    
    document.getElementById("image").value = "";

    showProducts();
}

function sellProduct(id) {

    let p = products.find(x => x.id == id);

    if (!p) return;

    if (p.qty <= 0) {
        alert("نفد المخزون");
        return;
    }

    p.qty--;

    if (p.currency === "LBP") {
    let rate = Number(localStorage.getItem("rate")) || 90000;
    totalMoney += p.price / rate;
} else {
    totalMoney += p.price;
}

    sales.push({
        product: p.name,
        price: p.price,
        date: new Date().toLocaleString()
    });

    saveProducts();

    showProducts();

}

function deleteProduct(id) {

    if (!confirm("حذف المنتج؟")) return;

    products = products.filter(x => x.id != id);

    saveProducts();

    showProducts();

}

function editProduct(id) {

    let p = products.find(x => x.id == id);

    if (!p) return;

    let newName = prompt("اسم المنتج", p.name);
    if (newName == null) return;

    let newPrice = prompt("السعر", p.price);
    if (newPrice == null) return;

    let newQty = prompt("الكمية", p.qty);
    if (newQty == null) return;

    p.name = newName;
    p.price = Number(newPrice);
    p.qty = Number(newQty);

    saveProducts();

    showProducts();

}

function showProducts() {
  
    let html = "";
    let totalQty = 0;

    const searchInput = document.getElementById("search");
    const search = searchInput ? searchInput.value.toLowerCase() : "";

    products
    .filter(p => p.name.toLowerCase().includes(search))
    .forEach(p => {

        totalQty += p.qty;

        html += `
        <div class="card">

            ${p.image
? `<img src="${p.image}"
style="width:120px;height:120px;object-fit:cover;border-radius:10px;margin:auto;display:block;">`
: ""}

<h3>${p.name}</h3>

${p.image ? `
<img src="${p.image}"
style="width:150px;height:150px;object-fit:cover;border-radius:12px;margin:10px auto;display:block;">
` : ""}

            <div id="qr-${p.id}" style="margin:15px auto;"></div>

            <p>💰 ${p.price} ${p.currency}</p>

            <p>📦 الكمية: ${p.qty}</p>

            ${p.qty === 0
            ? '<p style="color:red;font-weight:bold;">❌ نفد المخزون</p>'
            : p.qty <= 5
            ? '<p style="color:orange;font-weight:bold;">⚠️ المخزون منخفض</p>'
            : ""}

            <button onclick="sellProduct(${p.id})">
                💵 بيع
            </button>

            <br><br>

            <button onclick="editProduct(${p.id})"
                    style="background:orange;">
                ✏️ تعديل
            </button>

            <br><br>

            <button onclick="deleteProduct(${p.id})"
                    style="background:red;">
                🗑 حذف
            </button>

        </div>
        `;
    });

    if (products.length === 0) {
        html = "<h3 style='text-align:center'>لا يوجد منتجات</h3>";
    }

    document.getElementById("products").innerHTML = html;

    document.getElementById("countProducts").textContent = products.length;
    document.getElementById("countQty").textContent = totalQty;
    document.getElementById("totalMoney").textContent = totalMoney;
    document.getElementById("rate").value = rate;

    let salesHtml = "";

    sales.slice().reverse().forEach(s => {

        salesHtml += `
        <div class="card">
            <b>${s.product}</b><br>
            💰 ${s.price}<br>
            🕒 ${s.date}
        </div>
        `;

    });

    document.getElementById("sales").innerHTML = salesHtml;

    products.forEach(p => {

        const qr = document.getElementById("qr-" + p.id);

        if (!qr) return;

        qr.innerHTML = "";

        new QRCode(qr, {
            text: String(p.id),
            width: 120,
            height: 120
        });

    });

}
function saveRate(){

    let rate = Number(document.getElementById("rate").value);

    localStorage.setItem("rate", rate);

    alert("تم حفظ سعر الصرف");

}
function exportExcel() {
  alert("تم الضغط على الزر");

    let data = products.map(p => ({
        "الاسم": p.name,
        "السعر": p.price,
        "العملة": p.currency,
        "الكمية": p.qty
    }));

    let ws = XLSX.utils.json_to_sheet(data);

    let wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Products");

    XLSX.writeFile(wb, "Souhel-Shop.xlsx");

}
let scanner;

function startScanner() {

    document.getElementById("reader").innerHTML = "";

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        function(decodedText){

            scanner.stop();

            sellProduct(Number(decodedText));

            document.getElementById("reader").innerHTML="";

        },
        function(error){}
    );

}

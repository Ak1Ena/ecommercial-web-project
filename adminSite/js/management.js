let container = document.getElementById("container")

window.addEventListener("load", function() {
    loadAllProducts();
});

async function loadAllProducts() {
    console.log("Products button clicked");
    await fetch('http://localhost:4000/api/products/get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        console.log(data);
        container.innerHTML = `
                <table class="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Product name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Discount</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Categories</th>
                        <th scope="col">Image</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody id = "table-body"></tbody>
                </table>

            `
        const tableBody = document.getElementById("table-body");
        data.forEach(product => {
            const productRow = document.createElement("tr");
            productRow.innerHTML = `
                        <th scope="row">${product.id}</th>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>${product.discount}</td>
                        <td>${product.quantity}</td>
                        <td>${product.category}</td>
                        <td><img src="${product.img}" alt="${product.name}" style="width: 100px; height: auto;"></td>
                        <td>
                            <button class="btn btn-primary" onclick="editProduct(${product.id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
            `;
            tableBody.appendChild(productRow);
        });
    })
}
document.getElementById("Products").addEventListener("click", function() {
    loadAllProducts();
});

function editProduct(id) {
    console.log(`Edit Product button clicked for ID: ${id}`);
    fetch(`http://localhost:4000/api/products/get/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(product => {
        console.log(product);
        container.innerHTML = `
            <form id="editProductForm">
                <div class="mb-3">
                    <label for="name" class="form-label">Product Name</label>
                    <input type="text" class="form-control" id="name" value="${product.name}" required>
                </div>
                <div class="mb-3">
                    <label for="price" class="form-label">Price</label>
                    <input type="number" class="form-control" id="price" value="${product.price}" required>
                </div>
                <div class="mb-3">
                    <label for="discount" class="form-label">Discount</label>
                    <input type="number" class="form-control" id="discount" value="${product.discount || 0}">
                </div>
                <div class="mb-3">
                    <label for="quantity" class="form-label">Quantity</label>
                    <input type="number" class="form-control" id="quantity" value="${product.quantity}" required>
                </div>
                <div class="mb-3">
                    <label for="category" class="form-label">Category</label>
                    <input type="text" class="form-control" id="category" value="${product.category}" required>
                </div>
                <div class="mb-3">
                    <label for="img" class="form-label">Image URL</label>
                    <input type="text" class="form-control" id="img" value="${product.img}">
                </div>
                <button type="submit" class="btn btn-primary">Update Product</button>
            </form>
        `;

        document.getElementById("editProductForm").addEventListener("submit", function(event) {
            event.preventDefault();
            console.log("Edit Product form submitted");
            const name = document.getElementById("name").value;
            const price = document.getElementById("price").value;
            const discount = document.getElementById("discount").value || 0;
            const quantity = document.getElementById("quantity").value;
            const category = document.getElementById("category").value;
            const img = document.getElementById("img").value || '';

            fetch('http://localhost:4000/api/products/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, name, price, discount, quantity, category, img })
            })
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                console.log(data);
                alert('Product updated successfully');
                document.getElementById("Products").click(); // Refresh table
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update product');
            });
        });
    })
    .catch(error => {
        console.error('Error fetching product:', error);
        alert('Failed to fetch product data');
    });
}


function deleteProduct(id){
    console.log(`Delete Product button clicked for ID: ${id}`);
    fetch('http://localhost:4000/api/products/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    })
    .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
    })
    .then(data => {
        console.log(data);
        alert('Product deleted successfully');
        document.getElementById("Products").click(); 
    })

}

document.getElementById("AddProducts").addEventListener("click", function() {
    console.log("Add Product button clicked");
    container.innerHTML = `
        <form id="addProductForm">
            <div class="mb-3">
                <label for="name" class="form-label">Product Name</label>
                <input type="text" class="form-control" id="name" required>
            </div>
            <div class="mb-3">
                <label for="price" class="form-label">Price</label>
                <input type="number" class="form-control" id="price" required>
            </div>
            <div class="mb-3">
                <label for="discount" class="form-label">Discount</label>
                <input type="number" class="form-control" value=0 id="discount">
            </div>
            <div class="mb-3">
                <label for="quantity" class="form-label">Quantity</label>
                <input type="number" class="form-control" id="quantity" value=0 required>
            </div>
            <div class="mb-3">
                <label for="category" class="form-label">Category</label>
                <input type="text" class="form-control" id="category" required>
            </div>
            <div class="mb-3">
                <label for="img" class="form-label">Image URL</label>
                <input type="text" class="form-control" id="img">
            </div>
            <button type="submit" class="btn btn-primary" id="submitBtn">Add Product</button>
        </form>
    `;
    
    console.log("Add Product form displayed");
    document.getElementById("addProductForm").addEventListener("submit", function(event) {
        event.preventDefault();
        console.log("Add Product form submitted");
        const name = document.getElementById("name").value;
        const price = document.getElementById("price").value;
        const discount = document.getElementById("discount").value || 0;
        const quantity = document.getElementById("quantity").value;
        const category = document.getElementById("category").value;
        const img = document.getElementById("img").value || '';

        fetch('http://localhost:4000/api/products/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, price, discount, quantity, category, img })
        })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            console.log(data);
            alert('Product added successfully');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add product');
        });
    });

});





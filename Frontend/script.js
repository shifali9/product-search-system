async function searchProducts(){

    const query =
    document.getElementById("searchInput").value;

    const response =
    await fetch(
        `http://localhost:3000/search?q=${query}`
    );

    const data =
    await response.json();

    const results =
    document.getElementById("results");

    results.innerHTML="";

    data.hits.forEach(product=>{

        const item = product.document;

        results.innerHTML += `

        <div class="card">

            <img src="${item.image}">

            <h3>${item.title}</h3>

            <p><b>Store:</b> ${item.store}</p>

            <p><b>Category:</b> ${item.main_category}</p>

            <p class="price">$${item.price}</p>

            <p>⭐ ${item.average_rating}</p>

        </div>

        `;

    });

}
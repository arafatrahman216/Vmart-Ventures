<!-- Modify the HTML to add a button in each row -->
<tbody>
    <!-- Loop through products to generate table rows -->
    <% if (products.length > 0) { %>
        <% products.forEach(product => { %> 
            <tr>
                <td><%= product.PRODUCT_NAME.length > 12 ? product.PRODUCT_NAME.substring(0, 10) + '...' : product.PRODUCT_NAME %></td>
                <td><%= product.PRICE %></td>
                <td><%= product.STOCK_QUANTITY %></td>
                <td><%= product.PROMO_CODE %></td>
                <!-- Add a button to view details -->
                <td><button class="btn btn-primary view-details-btn" data-product-id="<%= product.ID %>">View Details</button></td>
                <!-- Add more columns as needed -->
            </tr>
        <% }); %>
    <% } else { %>
        <tr>
            <td colspan="5">No products found.</td>
        </tr>
    <% } %>
</tbody>

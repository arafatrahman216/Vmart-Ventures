<td>
    <select class="form-control delivery-status-select">
        <option value="Pending" <%= orders.DELIVERY_STATUS === "Pending" ? 'selected' : '' %>>Pending</option>
        <option value="Processing" <%= orders.DELIVERY_STATUS === "Processing" ? 'selected' : '' %>>Processing</option>
        <option value="Out for Delivery" <%= orders.DELIVERY_STATUS === "Out for Delivery" ? 'selected' : '' %>>Out for Delivery</option>
        <option value="Delivered" <%= orders.DELIVERY_STATUS === "Delivered" ? 'selected' : '' %>>Delivered</option>
    </select>
</td>

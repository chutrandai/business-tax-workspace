package com.business.tax.dto;

import java.util.Map;

public class DashboardStatsResponse {
    private long totalOrders;
    private String revenueMonth;
    private String revenueChange;
    private int pendingOrders;
    private String pendingChange;
    private long newCustomers;
    private String customersChange;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalOrders, String revenueMonth, String revenueChange,
                                  int pendingOrders, String pendingChange,
                                  long newCustomers, String customersChange) {
        this.totalOrders = totalOrders;
        this.revenueMonth = revenueMonth;
        this.revenueChange = revenueChange;
        this.pendingOrders = pendingOrders;
        this.pendingChange = pendingChange;
        this.newCustomers = newCustomers;
        this.customersChange = customersChange;
    }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public String getRevenueMonth() { return revenueMonth; }
    public void setRevenueMonth(String revenueMonth) { this.revenueMonth = revenueMonth; }
    public String getRevenueChange() { return revenueChange; }
    public void setRevenueChange(String revenueChange) { this.revenueChange = revenueChange; }
    public int getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(int pendingOrders) { this.pendingOrders = pendingOrders; }
    public String getPendingChange() { return pendingChange; }
    public void setPendingChange(String pendingChange) { this.pendingChange = pendingChange; }
    public long getNewCustomers() { return newCustomers; }
    public void setNewCustomers(long newCustomers) { this.newCustomers = newCustomers; }
    public String getCustomersChange() { return customersChange; }
    public void setCustomersChange(String customersChange) { this.customersChange = customersChange; }
}

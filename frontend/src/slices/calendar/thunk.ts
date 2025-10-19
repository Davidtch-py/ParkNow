import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Mock functions for calendar - replace with real API calls when needed
const mockEvents: any[] = [];
const mockCategories: any[] = [];

export const getEvents = createAsyncThunk("calendar/getEvents", async () => {
    try {
        return mockEvents;
    } catch (error) {
        return error;
    }
});

export const addEvents = createAsyncThunk("calendar/addEvents", async (event: any) => {
    try {
        mockEvents.push(event);
        toast.success("Event Added Successfully", { autoClose: 2000 });
        return event;
    } catch (error) {
        toast.error("Event Added Failed", { autoClose: 2000 });
        return error;
    }
});

export const updateEvents = createAsyncThunk("calendar/updateEvents", async (event: any) => {
    try {
        const index = mockEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
            mockEvents[index] = event;
        }
        toast.success("Event updated Successfully", { autoClose: 2000 });
        return event;
    } catch (error) {
        toast.error("Event updated Failed", { autoClose: 2000 });
        return error;
    }
});

export const deleteEvents = createAsyncThunk("calendar/deleteEvents", async (event: any) => {
    try {
        const index = mockEvents.findIndex(e => e.id === event.id);
        if (index !== -1) {
            mockEvents.splice(index, 1);
        }
        toast.success("Event deleted Successfully", { autoClose: 2000 });
        return event;
    } catch (error) {
        toast.error("Event deleted Failed", { autoClose: 2000 });
        return error;
    }
});

export const getCategory = createAsyncThunk("calendar/getCategory", async () => {
    try {
        return mockCategories;
    } catch (error) {
        return error;
    }
});

export const deleteCategory = createAsyncThunk("calendar/deleteCategory", async (event: any) => {
    try {
        const index = mockCategories.findIndex(c => c.id === event.id);
        if (index !== -1) {
            mockCategories.splice(index, 1);
        }
        toast.success("Category deleted Successfully", { autoClose: 2000 });
        return event;
    } catch (error) {
        toast.error("Category deleted Failed", { autoClose: 2000 });
        return error;
    }
});
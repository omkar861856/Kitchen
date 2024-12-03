import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from '../store/hooks/hooks';
import { createInventoryItem, fetchInventory } from '../store/slices/menuSlice';
import { useAppDispatch } from '../store/hooks/hooks';
import axios from 'axios';
import { setCart } from '../store/slices/cartSlice';
import { Typography, TextField, Button, Grid, Box, Card, CardContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import './MenuManagement.css';
import { deleteInventoryItem } from '../store/slices/menuSlice';
import { updateInventoryItem } from '../store/slices/menuSlice';
import { InventoryItem } from '../store/slices/menuSlice';
import { apiUrl } from '../Layout';

// Menu Management Component
const MenuManagement = () => {
    const dispatch = useAppDispatch();
    const inventory = useAppSelector(state => state.menu);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [updateComponent, setUpdateComponent] = useState(0);
    const [itemIdToUpdate, setItemIdToUpdate] = useState("")

    const initialFormValues = {
        name: '',
        category: '',
        price: 0,
        quantityAvailable: 0,
        image: null,
    };

    const initialErrors = {
        name: '',
        category: '',
        price: '',
        quantityAvailable: '',
        image: '',
    };

    const [formValues, setFormValues] = useState(initialFormValues);
    const [errors, setErrors] = useState(initialErrors);
    const [editing, setEditing] = useState(false); // Flag to check if it's an edit action

    useEffect(() => {
        dispatch(fetchInventory());
    }, [dispatch, updateComponent]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formValues.name) newErrors.name = 'Item name is required.';
        if (!formValues.category) newErrors.category = 'Category is required.';
        if (formValues.price <= 0) newErrors.price = 'Price must be greater than zero.';
        if (formValues.quantityAvailable <= 0) newErrors.quantityAvailable = 'Quantity must be greater than zero.';
        if (!image) newErrors.image = 'Item image is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file); // Read file to set preview
        } else {
            setImage(null);
            setImagePreview('');
        }
    };

    const resetForm = () => {
        setFormValues(initialFormValues);
        setImage(null);
        setImagePreview('');
        setErrors(initialErrors); // Reset the errors too
    };

    const submitForm = async () => {
        if (validateForm()) {
            const formData = new FormData();
            formData.append('name', formValues.name);
            formData.append('category', formValues.category);
            formData.append('price', formValues.price.toString());
            formData.append('quantityAvailable', formValues.quantityAvailable.toString());
            formData.append('image', image as Blob); // Attach the image file here
            formData.append('createdAt', new Date().toISOString());
            formData.append('itemId', uuidv4());
            formData.append('availability', 'true');

            try {
                const response = await axios.post(`${apiUrl}/inventory`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (response.data) {
                    setUpdateComponent((state) => state + 1);
                    resetForm();
                }
                console.log('Form submitted successfully!', response.data);
            } catch (error) {
                console.error('Error submitting form', error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {


            const formData = new FormData();
            formData.append('name', formValues.name);
            formData.append('category', formValues.category);
            formData.append('price', formValues.price.toString());
            formData.append('quantityAvailable', formValues.quantityAvailable.toString());
            formData.append('image', image as Blob); // Attach the image file here
            formData.append('createdAt', new Date().toISOString());
            formData.append('itemId', uuidv4());
            formData.append('availability', 'true');
            console.log(formData)
            try {
                const response = await axios.post(`${apiUrl}/inventory/${itemIdToUpdate}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                if (response.data) {
                    setUpdateComponent((state) => state + 1);
                    resetForm();
                }
                console.log('Form edited successfully!', response.data);
            } catch (error) {
                console.error('Error submitting form', error);
            }


        }
        else {

            if (validateForm()) {
                submitForm();
            } else {
                console.log('Validation errors:', errors);
            }

        }

    };

    const handleEdit = (item: any) => {
        setEditing(true);

        setFormValues({
            name: item.name,
            category: item.category,
            price: item.price,
            quantityAvailable: item.quantityAvailable,
            image: item.image,
        });

        setImagePreview(`${apiUrl}/inventory/${item.itemId}`)
    };

    const handleDelete = (itemId: string) => {
        dispatch(deleteInventoryItem(itemId)); // Dispatch action to delete the item
        setUpdateComponent((state) => state + 1); // Trigger an update after deletion
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                {editing ? 'Edit Menu Item' : 'Create Menu Item'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Item Name"
                            variant="outlined"
                            fullWidth
                            name="name"
                            value={formValues.name}
                            onChange={handleInputChange}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formValues.category}
                                onChange={handleInputChange}
                                label="Category"
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                <MenuItem value="breakfast">Breakfast</MenuItem>
                                <MenuItem value="main">Main</MenuItem>
                                <MenuItem value="beverages">Beverage</MenuItem>
                            </Select>
                            {errors.category && <p style={{ color: 'red' }}>{errors.category}</p>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Price"
                            variant="outlined"
                            fullWidth
                            name="price"
                            value={formValues.price}
                            onChange={handleInputChange}
                            error={!!errors.price}
                            helperText={errors.price}
                            type="number"
                            min="0"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Quantity Available"
                            variant="outlined"
                            fullWidth
                            name="quantityAvailable"
                            value={formValues.quantityAvailable}
                            onChange={handleInputChange}
                            error={!!errors.quantityAvailable}
                            helperText={errors.quantityAvailable}
                            type="number"
                            min="0"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="image-upload"
                        />
                        <label htmlFor="image-upload">
                            <Button variant="contained" component="span" fullWidth>
                                Upload Item Image
                            </Button>
                        </label>
                        {errors.image && <p style={{ color: 'red' }}>{errors.image}</p>}
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Selected item"
                                style={{
                                    width: '200px',
                                    marginTop: '10px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                }}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        {editing ? <Button variant="contained" color="primary" fullWidth type="submit">
                            'Update Item'
                        </Button> :
                            <Button variant="contained" color="primary" fullWidth type="submit">
                                'Submit'
                            </Button>
                        }

                    </Grid>
                </Grid>
            </form>
            <Menu setItemIdToUpdate={setItemIdToUpdate} handleDelete={handleDelete} handleEdit={handleEdit} />
        </Box>
    );
};

// Menu Component
const Menu = ({ handleEdit, handleDelete, setItemIdToUpdate }) => {
    const dispatch = useAppDispatch();
    const inventory = useAppSelector(state => state.menu);

    useEffect(() => {
        dispatch(fetchInventory());
    }, [dispatch]);

    return (
        <Box sx={{ padding: '20px' }}>
            {inventory.map((i) => (
                <MenuI setItemIdToUpdate={setItemIdToUpdate} key={i.itemId} item={i} handleDelete={handleDelete} handleEdit={handleEdit} />
            ))}
        </Box>
    );
};

function MenuI({ item,setItemIdToUpdate, handleEdit, handleDelete }) {
    const dispatch = useAppDispatch();
    // Add item to cart
    const addItemToCart = () => {
        const serializedItem = {
            ...item,
            quantity: 2,
        };
        dispatch(setCart(serializedItem)); // Dispatching with the serialized item
    };

    return (
        <Card sx={{ marginBottom: '20px', boxShadow: 3, borderRadius: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <img
                    src={`${apiUrl}/inventory/${item.itemId}`}
                    alt={item.name}
                    style={{
                        width: '150px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                />
                <Box sx={{ flex: 1, marginLeft: '16px' }}>
                    <Typography variant="h5" color="primary">
                        {item.name}
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        Rs {item.price}
                    </Typography>
                    <Box sx={{ display: 'flex', marginTop: '10px' }}>
                        <Button variant="outlined" color="primary" onClick={() =>{ handleEdit(item); setItemIdToUpdate(item.itemId)}} sx={{ marginRight: '8px' }}>
                            Edit
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => handleDelete(item.itemId)}>
                            Delete
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
export default MenuManagement;
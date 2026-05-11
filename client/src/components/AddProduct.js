import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  styled
} from '@mui/material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  height: '100%',
}));

const StyledButton = styled(Button)({
  borderRadius: '5px',
  padding: '10px 0',
  fontSize: '1rem',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  width: '100%',
  backgroundColor: '#1976d2',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: '5px',
    backgroundColor: 'white',
  },
}));

const RightSidePaper = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const RightSideSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: '1px solid #eee',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    seller: '',
    category: '',
    brand: '',
    description: '',
    size: '',
  });

  const [newCategory, setNewCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Left side - Add Product Form */}
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              ADD NEW PRODUCT
            </Typography>
            <form onSubmit={handleSubmit}>
              <StyledTextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
              />
              <StyledTextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price"
              />
              <StyledTextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Stock"
              />
              <StyledTextField
                fullWidth
                select
                label="Seller"
                name="seller"
                value={formData.seller}
                onChange={handleChange}
              >
                <MenuItem value="">Select Seller</MenuItem>
                {/* Add seller options here */}
              </StyledTextField>
              <StyledTextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <MenuItem value="">Select Category</MenuItem>
                {/* Add category options here */}
              </StyledTextField>
              <StyledTextField
                fullWidth
                select
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              >
                <MenuItem value="">Select brand</MenuItem>
                {/* Add brand options here */}
              </StyledTextField>
              <StyledTextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
              />
              <StyledTextField
                fullWidth
                select
                label="Size"
                name="size"
                value={formData.size}
                onChange={handleChange}
              >
                <MenuItem value="">Select Product Size</MenuItem>
                <MenuItem value="S">Small</MenuItem>
                <MenuItem value="M">Medium</MenuItem>
                <MenuItem value="L">Large</MenuItem>
                <MenuItem value="XL">Extra Large</MenuItem>
              </StyledTextField>
              <StyledButton
                type="submit"
              >
                ADD PRODUCT
              </StyledButton>
            </form>
          </StyledPaper>
        </Grid>

        {/* Right side - Create New Options */}
        <Grid item xs={12} md={4}>
          <RightSidePaper>
            {/* Create New Seller */}
            <RightSideSection>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                CREATE NEW SELLER
              </Typography>
              <StyledButton>
                CREATE SELLER
              </StyledButton>
            </RightSideSection>

            {/* Create New Category */}
            <RightSideSection>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                CREATE NEW CATEGORY
              </Typography>
              <StyledTextField
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category Name"
              />
              <StyledButton>
                CREATE CATEGORY
              </StyledButton>
            </RightSideSection>

            {/* Create New Brand */}
            <RightSideSection>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                CREATE NEW BRAND
              </Typography>
              <StyledTextField
                fullWidth
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Brand Name"
              />
              <StyledButton>
                CREATE BRAND
              </StyledButton>
            </RightSideSection>
          </RightSidePaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddProduct; 
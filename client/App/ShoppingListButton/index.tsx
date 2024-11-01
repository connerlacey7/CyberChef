import { Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingList from './ShoppingList';
import { Close } from '@mui/icons-material';

export default function ShoppingListButton() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <IconButton
                onClick={() => setDrawerOpen((prevState) => !prevState)}
            >
                <ShoppingCartIcon htmlColor="white" />
            </IconButton>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <div style={{ width: '50vw' }}>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography
                            variant="h4"
                            style={{
                                marginLeft: 32,
                                marginTop: 16,
                                marginBottom: 16,
                            }}
                        >
                            Shopping list
                        </Typography>
                        <div style={{ marginTop: 8, marginRight: 8 }}>
                            <IconButton onClick={() => setDrawerOpen(false)}>
                                <Close />
                            </IconButton>
                        </div>
                    </Stack>
                    <ShoppingList />
                </div>
            </Drawer>
        </>
    );
}

'use client'


import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from './firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}
export default function Home() {

  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [updateState, setUpdateState] = useState(false)
  const [itemName, setItemName] = useState('')
  const [updateName, setUpdateName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [filterName, setFilterName]= useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const updateItem = async (itemName, itemQuantity) => {
    
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      await setDoc(docRef, { quantity: itemQuantity })
    }
    await updateInventory()
  }



  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleUpdateState = () => setUpdateState(!updateState)
 



  const filterItem = ()=>{
    const filteredItems=inventory.filter(function(item){
      if (item.name == filterName){
        return item
      }
    })
    setInventory(filteredItems)
  }

  const cancelFilter = () =>{
    updateInventory()
  }



  return (
    <Box
    width="100vw"
    height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
  >
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>
        <Stack width="100%" direction={'row'} spacing={2}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>

    <Modal
      open={updateState}
      onClose={handleUpdateState}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Update Item
        </Typography>
        <Stack width="100%" direction={'row'} spacing={2}>
          <TextField
            id="outlined-basic"
            label="Quantity"
            variant="outlined"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Button
            variant="outlined"
            onClick={() => {
              updateItem(updateName, quantity)
              setQuantity('')
              handleUpdateState()
            }}
          >
            Update
          </Button>
        </Stack>
      </Box>
    </Modal>
    
    <Box 
      display={'flex'}
      width={'80%'}
      maxWidth={"950px"}
      
    >
      <TextField
              id="outlined-basic"
              label=""
              variant="outlined"
              sx={{
                width: '80%',
                marginRight: '10px'
              }}
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
      <Button variant="contained" sx={{
                marginRight: '10px'
              }} onClick={filterItem}>
        Search
      </Button>
      <Button variant="contained" onClick={cancelFilter}>
        Cancel
      </Button>
    </Box>

    <Box border={'1px solid #333'}  width="80%" maxWidth={"950px"}>
      <Box
        width="100%"
        height="100px"
        bgcolor={'#ADD8E6'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
          Inventory Items
        </Typography>
      </Box>
      <Stack width="100%" height="300px" spacing={2} overflow={'auto'} >
        {inventory.map(({name, quantity}) => (
          <Box
            key={name}
            width="100%"
            minHeight="150px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            paddingX={5}
          >
            <Typography variant={'h5'} color={'green'} fontWeight={'bold'} textAlign={'center'} >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h5'} fontWeight={'bold'} color={'#333'} textAlign={'center'}>
              Quantity: {quantity}
            </Typography>
            <Button variant="contained" onClick={() => {
              setUpdateName(name)
              handleUpdateState()
            }
            }>
              Update
            </Button>
            <Button variant="contained" color='error'  onClick={() => removeItem(name)}
              >
              Remove
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
    <Button variant="contained" onClick={handleOpen}>
      Add New Item
    </Button>
  </Box>
  )
}

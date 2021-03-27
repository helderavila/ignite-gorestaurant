import { useState, useEffect } from 'react';

// Components
import { Header } from '../../components/Header';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';

// Styles
import { FoodsContainer } from './styles';

// Services
import api from '../../services/api';

interface FoodData {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

type NewFoodData = Omit<FoodData, "id" | "available">

export function Dashboard() {
  const [foods, setFoods] = useState<FoodData[]>([])
  const [editingFood, setEditingFood] = useState<FoodData>({} as FoodData)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  async function handleAddFood(food: NewFoodData) {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods(state => [...state, response.data])
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: NewFoodData) {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  async function toggleModal() {
    setModalOpen(state => !state)
  }

  async function toggleEditModal() {
    setEditModalOpen(state => !state)
  }

  async function handleEditFood(food: FoodData) {
    setEditingFood(food)
    setEditModalOpen(true)
  }

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get('/foods');
      setFoods(response.data)
    }

    loadFoods()
  },[])


  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={(food: NewFoodData) => handleAddFood(food)}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={(food: NewFoodData) => handleUpdateFood(food)}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={(foodId) => handleDeleteFood(foodId)}
              handleEditFood={(food) => handleEditFood(food)}
            />
          ))}
      </FoodsContainer>
    </>
  )
}

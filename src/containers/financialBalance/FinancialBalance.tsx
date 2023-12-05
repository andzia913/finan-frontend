import {useEffect, useState, useRef} from 'react';
import TableBalance from "../../components/TableBalance/TableBalance.tsx";
import {tableColumns} from "../../components/TableBalance/tableColumns";
import FormBalanceRecord from '../../components/FormBalaceRecord/FormBalanceRecord.tsx';
import { BalanceEntity } from 'types/balance.entity.ts';
import { CategoryEntity } from 'types/category.entity.ts';
import { TypeEntity } from 'types/type.entity.ts';
import { Button, CircularProgress, Dialog } from '@mui/material';
import NavBar from '../../components/NavBar/Navbar.tsx';


const FinancialBalance = () => {
  const [balanceData, setBalanceData] = useState<BalanceEntity[]>();
  const [categoriesData, setCategoriesData]= useState<CategoryEntity[]>()
  const [typesData, setTypesData]= useState<TypeEntity[]>()
  const [recordToEdit, setRecordToEdit] = useState<BalanceEntity | null>(null);
  const [isVisilbeFormAdd, setIsVisibleFormAdd] = useState(false);
  const [isVisilbeFormEdit, setIsVisibleFormEdit] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const balanceDataRef = useRef<BalanceEntity[] | null>(null);
  const categoriesDataRef = useRef<CategoryEntity[] | null>(null);
  const typesDataRef = useRef<TypeEntity[] | null>(null);

  const fetchBalanceData = async () => {
    const res = await fetch('http://localhost:5000/financialBalance');
    const data: BalanceEntity[] = await res.json();
    balanceDataRef.current = data;
    setBalanceData(data);
  };

  const handleEditClick = (id: string) =>{
    const fetchRecordData = async () => {
      const res = await fetch(`http://localhost:5000/financialBalance/get-one/${id}`);
      const data: BalanceEntity = await res.json();
      const dataCorectedDate = {...data, date: new Date(data.date)}
      setRecordToEdit(dataCorectedDate);
      setIsVisibleFormEdit(true)
      console.log( 'dane recordu do edycji', dataCorectedDate)
    };
    fetchRecordData()
  }
  const handleSubmit = async (formData: FormData, isEditMode: boolean) => {
    if(isEditMode){
      try{
        console.log('probujemy aktualizowac', formData)
        const response = await fetch(`http://localhost:5000/financialBalance/update/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        setRecordToEdit(null)
        fetchBalanceData();
         if (response.ok) {
        const responseData = await response.json();
        console.log('Dane zostały pomyślnie zaktualizoane.', responseData);
      } else {
        console.error('Błąd podczas wysyłania danych na serwer.');}
       } catch (error) {
        console.error('Błąd podczas wysyłania danych na serwer.', error)
    }
    setIsVisibleFormEdit(false)
  }else{
      try{
      console.log(formData, 'to probujemy wysłać')
      const response = await fetch('http://localhost:5000/financialBalance/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      fetchBalanceData();
       if (response.ok) {
      const responseData = await response.json();
      console.log('Dane zostały pomyślnie wysłane na serwer.', responseData);
    } else {
      console.error('Błąd podczas wysyłania danych na serwer.');}
     } catch (error) {
      console.error('Błąd podczas wysyłania danych na serwer.', error)
  }}};

  useEffect(()=>{
    if(balanceData && categoriesData && typesData){
      setLoadingData(false);}
      else{
        setLoadingData(true)
      }
  },[balanceData,categoriesData, typesData])
  useEffect(() => {
    fetchBalanceData();
  }, [balanceDataRef]);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      const res = await fetch('http://localhost:5000/financialBalance/categories');
      const categories: CategoryEntity[] = await res.json();
      categoriesDataRef.current = categories;
      setCategoriesData(categories);
    };

    fetchCategoriesData();
  }, [categoriesDataRef]);

  useEffect(() => {
    const fetchTypesData = async () => {
      const res = await fetch('http://localhost:5000/financialBalance/types');
      const types: TypeEntity[] = await res.json();
      // typesDataRef.current = types;
      setTypesData(types);
      console.log(types);
    };

    fetchTypesData();
  }, [typesDataRef]);
  

  
  return (
    <>
    <NavBar/>
    <Button
      variant="contained"
      color="primary"
      onClick={() => setIsVisibleFormAdd(isVisilbeFormAdd ? false : true)}
    >
      Dodaj nowy rekord
    </Button>
  
    {loadingData ? <CircularProgress/> : <>
    {isVisilbeFormAdd ? <FormBalanceRecord categories={categoriesData} types={typesData} recordToEdit={recordToEdit} handleSubmit={handleSubmit}/>: ''}
    <Dialog open={isVisilbeFormEdit} maxWidth={undefined}>
      <FormBalanceRecord categories={categoriesData} types={typesData} recordToEdit={recordToEdit} handleSubmit={handleSubmit}/>
    </Dialog>
    <TableBalance columns={tableColumns} data={balanceData} handleEditClick={handleEditClick} handleDeleteClick={fetchBalanceData}/></>
  }
    </>
    
  );
};

export default FinancialBalance;

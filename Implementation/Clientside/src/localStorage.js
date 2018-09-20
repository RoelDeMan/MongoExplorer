//Get current state
export const loadState = () => {
  try{
    const serializedState = localStorage.getItem('state');
    if(serializedState === null){
      return undefined;
    }
    return JSON.parse(serializedState);
  }catch(err){
    return undefined;
  }
};


//Save the state
export const saveState = (state) => {
  try{
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  }catch(err){
    //ignore
  }
};

import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import GothamTaskPipeline from './GothamTaskPipeline';

function Tasks() {
  const { loadTasks } = useStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="relative w-full h-full">
      <GothamTaskPipeline />
    </div>
  );
}

export default Tasks;

import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const CustomMotives = ({ onChange = () => {} }) => {
  const [motives, setMotives] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCause, setNewCause] = useState({ title: '', description: '' });

  useEffect(() => {
    onChange(motives);
  }, [motives, onChange]);

  const handleAddCause = () => {
    if (newCause.title && newCause.description) {
      setMotives(prevMotives => [...prevMotives, newCause]);
      setNewCause({ title: '', description: '' });
      setIsAdding(false);
    }
  };

  const handleRemoveCause = (index, e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    setMotives(prevMotives => prevMotives.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {motives.map((motive, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
            <CardTitle className="text-sm font-medium">{motive.title}</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => handleRemoveCause(index, e)}
              type="button" // Explicitly set button type to prevent form submission
            >
              <X size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{motive.description}</p>
          </CardContent>
        </Card>
      ))}
      
      {isAdding ? (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Input
              placeholder="Motive Title"
              value={newCause.title}
              onChange={(e) => setNewCause({ ...newCause, title: e.target.value })}
            />
            <Textarea
              placeholder="Motive Description"
              value={newCause.description}
              onChange={(e) => setNewCause({ ...newCause, description: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAdding(false)} type="button">Cancel</Button>
              <Button onClick={handleAddCause} type="button">Add Motive</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100" type="button">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Custom Motive
        </Button>
      )}
    </div>
  );
};
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    contractId: {
      type: String,
      required: true,
    },
    updatedResources: { // Replace "items" with a more descriptive name if needed
      type: Array,
      required: true
    },
    totalExpense:{
      type:Number
    },
    progressReport: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    receiptFile: {
      type: String,
      default: null,  
    },
    remainingProjectBudget :{
      type:Number
    },
  });
  
export const Expense = mongoose.model('expenses', expenseSchema);

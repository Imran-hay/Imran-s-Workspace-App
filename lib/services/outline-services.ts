import axios from 'axios';
import { z } from "zod";
import { outlineSchema, OutlinesResponse } from '../types';

const baseURL = process.env.NEXT_PUBLIC_APP_URL!;

export const outlineService = {
  async getOutlines(organizationId: string): Promise<OutlinesResponse> {
    try {
      const response = await axios.get(
        `${baseURL}/api/organizations/${organizationId}/outlines`,
        { withCredentials: true }
      );

      const validatedData = z.object({
        outlines: z.array(outlineSchema),
      }).parse(response.data);

      return validatedData;
    } catch (error) {
      console.error('Error fetching outlines:', error);
      return {
        outlines: [],
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  },

  async createOutline(organizationId: string, outlineData: {
    header: string;
    sectionType: string;
    status: string;
    target: number;
    limit: number;
    reviewer: string;
  }) {
    try {
      const response = await axios.post(
        `${baseURL}/api/organizations/${organizationId}/outlines`,
        outlineData,
        { withCredentials: true }
      );

      return { outline: response.data.outline };
    } catch (error) {
      console.error('Error creating outline:', error);
      return {
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  },

  async updateOutline(organizationId: string, outlineId: string, updateData: {
    header?: string;
    sectionType?: string;
    status?: string;
    target?: number;
    limit?: number;
    reviewer?: string;
  }) {
    try {
      const response = await axios.put(
        `${baseURL}/api/organizations/${organizationId}/outlines/${outlineId}`,
        updateData,
        { withCredentials: true }
      );

      return { outline: response.data.outline };
    } catch (error) {
      console.error('Error updating outline:', error);
      return {
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  },

  async deleteOutline(organizationId: string, outlineId: string) {
    try {
      await axios.delete(
        `${baseURL}/api/organizations/${organizationId}/outlines/${outlineId}`,
        { withCredentials: true }
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting outline:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }
};
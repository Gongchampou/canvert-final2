import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service for card generations
export class CardGenerationService {
    /**
     * Save a card generation to the database
     * @param {Object} data - The card generation data
     * @returns {Promise<Object>} The saved record
     */
    static async saveGeneration(data) {
        const { data: result, error } = await supabase
            .from('card_generations')
            .insert([{
                video_type: data.videoType,
                image_type: data.imageType,
                video_links: data.videoLinks,
                image_links: data.imageLinks,
                titles: data.titles,
                descriptions: data.descriptions,
                generated_html: data.generatedHtml
            }])
            .select()
            .single()

        if (error) {
            throw new Error(`Failed to save generation: ${error.message}`)
        }

        return result
    }

    /**
     * Get recent card generations
     * @param {number} limit - Number of records to fetch
     * @returns {Promise<Array>} Array of card generations
     */
    static async getRecentGenerations(limit = 10) {
        const { data, error } = await supabase
            .from('card_generations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            throw new Error(`Failed to fetch generations: ${error.message}`)
        }

        return data || []
    }

    /**
     * Get a specific card generation by ID
     * @param {string} id - The generation ID
     * @returns {Promise<Object>} The card generation
     */
    static async getGenerationById(id) {
        const { data, error } = await supabase
            .from('card_generations')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            throw new Error(`Failed to fetch generation: ${error.message}`)
        }

        return data
    }

    /**
     * Delete a card generation
     * @param {string} id - The generation ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteGeneration(id) {
        const { error } = await supabase
            .from('card_generations')
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(`Failed to delete generation: ${error.message}`)
        }

        return true
    }

    /**
     * Search card generations by title or description
     * @param {string} query - Search query
     * @param {number} limit - Number of records to fetch
     * @returns {Promise<Array>} Array of matching card generations
     */
    static async searchGenerations(query, limit = 10) {
        const { data, error } = await supabase
            .from('card_generations')
            .select('*')
            .or(`titles::text.ilike.%${query}%, descriptions::text.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            throw new Error(`Failed to search generations: ${error.message}`)
        }

        return data || []
    }
}

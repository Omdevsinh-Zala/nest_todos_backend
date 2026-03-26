import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagService {
    constructor(private readonly supabase: SupabaseService) {}

    async getAllTags(token: string, user_id: string) {
        const { data, error } = await this.supabase
            .forUser(token)
            .from('tags')
            .select('*')
            .eq('user_id', user_id)
            .order('is_pinned', { ascending: false })
            .order('name', { ascending: true });

        if (error) {
            throw error;
        }
        return data;
    }

    async createTag(token: string, user_id: string, tag: CreateTagDto) {
        const { data, error } = await this.supabase
            .forUser(token)
            .from('tags')
            .insert({ ...tag, user_id: user_id, color: '#000000' })
            .select('*')
            .single();

        if (error) {
            console.log(error)
            throw error;
        }
        return data;
    }

    async updateTag(token: string, user_id: string, id: string, tag: UpdateTagDto) {
        const { data, error } = await this.supabase
            .forUser(token)
            .from('tags')
            .update({ ...tag })
            .eq('id', id)
            .eq('user_id', user_id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    async togglePin(token: string, user_id: string, id: string) {

        const { data: pinedData, error: isPinnedError } = await this.supabase
            .forUser(token)
            .from('tags')
            .select('is_pinned')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();

        if (isPinnedError) {
            throw isPinnedError;
        }

        const { data, error } = await this.supabase
            .forUser(token)
            .from('tags')
            .update({ is_pinned: !pinedData.is_pinned })
            .eq('id', id)
            .eq('user_id', user_id)
            .select('*')
            .single();

        if (error) {
            throw error;
        }
        return data;
    }

    async deleteTag(token: string, user_id: string, id: string) {
        const { data, error } = await this.supabase
            .forUser(token)
            .rpc('soft_delete_tag', { tag_id: id });

        if (error) {
            throw error;
        }
        return 'Tag deleted successfully';
    }
}

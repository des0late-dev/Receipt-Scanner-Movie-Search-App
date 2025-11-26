import { API_KEY_MOVIE } from '@env';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function MoviesScreen(){

const api_key= API_KEY_MOVIE
const image_base = 'https://image.tmdb.org/t/p/w500';

const [query, setQuery] = useState('');
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);


const [selected, setSelected] = useState(null);
const [detailsLoading, setDetailsLoading] = useState(false);

async function searchMovies(){

    setLoading(true)
    setError(null)
    setResults([])
    if (!query.trim()) {
        setError('Please enter a search term');
        setLoading(false);
        return;
    }
try{
const url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${encodeURIComponent(query)}`;
const res = await fetch(url);
const data = await res.json();
console.log('TMDB search data', data);
if (res.ok) setResults(data.results || []);
} catch (e) {
    setError('Failed to load movies.');
} finally {
setLoading(false);
}
}

async function loadDetails(id){
    setDetailsLoading(true)
    try{
           const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${api_key}&append_to_response=credits`;
const res = await fetch(url);
const data = await res.json();
setSelected(data);

    }
    catch(error){
        setError('Could not load details')
    }
    finally{
        setDetailsLoading(false)
    }
}


const renderItem = ({ item }) => {
    const posterPath = item.poster_path || item.backdrop_path;
    return (
        <TouchableOpacity onPress={() => loadDetails(item.id)} style={styles.card} activeOpacity={0.8}>
            {posterPath ? (
                <Image source={{ uri: image_base + posterPath }} style={styles.poster} />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No image</Text>
                </View>
            )}
                <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                
                <Text style={styles.year}>{item.release_date?.slice(0, 4) || 'N/A'}</Text>
            </View>

        </TouchableOpacity>
    );
}




    return (
<SafeAreaView style={{flex:1,padding:16,}}>
    
<Text style={{textAlign:'center',fontSize: 16,
        fontWeight: 'bold' }}>Movie Search</Text>


<View style={{flexDirection:'row'}}>
<TextInput
value={query}
onChangeText={setQuery}
style={styles.input}
/>


<TouchableOpacity style={[styles.searchButton, query.trim() ? null : styles.searchButtonDisabled]} onPress={searchMovies} disabled={!query.trim()}>
    <Text style={styles.searchButtonText}>Search</Text>
</TouchableOpacity>
</View>

{loading && (
    <View style={styles.loadingOverlay} pointerEvents="none">
        <ActivityIndicator size="large" color="#fff" />
    </View>
)}
{error && (
    <View style={styles.errorBox}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)} style={styles.errorClose}>
            <Text style={styles.errorCloseText}>X</Text>
        </TouchableOpacity>
    </View>
)}


<FlatList
data={results}
keyExtractor={(item) => item.id.toString()}
renderItem={renderItem}
style={styles.list}
/>

{!loading && results.length === 0 && (
    <Text style={styles.noResults}>Type movie name and click on Search</Text>
)}



<Modal visible={selected!==null} animationType="slide">
<SafeAreaView style={styles.modalContainer}>
<TouchableOpacity
onPress={() => setSelected(null)}
>
<Text style={styles.modalCloseText}>Close</Text>
</TouchableOpacity>


{detailsLoading ? (
<ActivityIndicator size="large" />
 ) : selected ? (
<View style={styles.modalContent}>
    {selected.poster_path && (
        <Image source={{ uri: image_base + (selected.poster_path || selected.backdrop_path) }} style={styles.modalPoster} resizeMode="cover" />
    )}
    <Text style={styles.modalTitle}>{selected.title}</Text>
    <Text style={styles.modalSection}>Plot</Text>
    <Text style={styles.modalText}>{selected.overview || 'No overview'}</Text>


<Text>Rating</Text>
<Text>{selected.vote_average} / 10</Text>


<Text style={styles.modalSection}>Top Cast</Text>
{selected.credits?.cast?.slice(0, 5).map((c) => (
    <Text key={c.cast_id} style={styles.modalText}>{c.name} as {c.character}</Text>
))}
</View>
) : null}
</SafeAreaView>

 
</Modal>
</SafeAreaView>
);

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#fff',
        
    },
    poster: {
        width: 80,
        height: 120,
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    placeholder: {
        width: 80,
        height: 120,
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#666',
    },
    details: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    year: {
        color: '#666',
        marginTop: 4,
    },
    header: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    list: {
        marginTop: 20,
        paddingBottom: 80,
    },
    noResults: {
        textAlign: 'center',
        marginTop: 24,
        color: '#666',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffdddd',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    errorText: {
        color: '#900',
        flex: 1,
    },
    errorClose: {
        marginLeft: 8,
        paddingHorizontal: 8,
    },
    errorCloseText: {
        color: '#900',
        fontWeight: '700',
    },
    modalContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    modalContent: {
        paddingVertical: 8,
    },
    modalPoster: {
        width: '100%',
        height: 220,
        borderRadius: 8,
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    modalSection: {
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 6,
    },
    modalText: {
        color: '#333',
    },
    modalCloseText: {
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 8,
        marginVertical: 12,
        backgroundColor: '#fff',
        flex:1,
        marginRight:20
    },
    searchButton: {
        backgroundColor: '#007AFF',
    height:40,
    marginTop:12,
    width:90,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchButtonDisabled: {
        backgroundColor: '#9cc2ff'
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center'
    },
});
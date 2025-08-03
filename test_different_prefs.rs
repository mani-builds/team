// Test different preference combinations
mod recommendations;

fn main() {
    let excel_path = "preferences/projects/DFC-ActiveProjects.xlsx";
    
    let test_cases = vec![
        vec!["Agriculture".to_string()],
        vec!["Healthcare Access".to_string()],
        vec!["Education".to_string()],
        vec!["Rural Development".to_string()],
        vec!["Invalid Preference".to_string()],
    ];
    
    for (i, preferences) in test_cases.iter().enumerate() {
        println!("\n🔍 Test Case {}: {:?}", i + 1, preferences);
        match recommendations::get_recommendations(preferences, excel_path) {
            Ok(projects) => {
                println!("✅ Found {} matching projects", projects.len());
                for project in projects.iter().take(2) {
                    println!("   - {}: {}", project.project_name, project.department);
                }
            }
            Err(e) => println!("❌ Error: {}", e),
        }
    }
}
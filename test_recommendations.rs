// Test the recommendations functionality
use std::path::Path;

mod recommendations;

fn main() {
    println!("Testing Recommendations Feature");
    println!("================================");
    
    // Test with the actual Excel file
    let excel_path = "preferences/projects/DFC-ActiveProjects.xlsx";
    
    if !Path::new(excel_path).exists() {
        println!("❌ Excel file not found: {}", excel_path);
        return;
    }
    
    println!("✅ Excel file found: {}", excel_path);
    
    // Test preferences
    let test_preferences = vec![
        "Agriculture".to_string(),
        "Technology Innovation".to_string(),
        "Financial Inclusion".to_string(),
    ];
    
    println!("🔍 Testing with preferences: {:?}", test_preferences);
    
    match recommendations::get_recommendations(&test_preferences, excel_path) {
        Ok(projects) => {
            println!("✅ Successfully loaded {} projects", projects.len());
            
            for (i, project) in projects.iter().enumerate() {
                println!("\n📋 Project {}: {}", i + 1, project.project_name);
                println!("   Description: {}", project.project_description);
                println!("   Department: {}", project.department);
                println!("   NAICS Sector: {}", project.naics_sector);
                println!("   Committed: ${}", project.committed);
                println!("   Country: {}", project.country);
            }
            
            if projects.is_empty() {
                println!("⚠️  No matching projects found for the given preferences");
            }
        }
        Err(e) => {
            println!("❌ Error loading recommendations: {}", e);
        }
    }
}
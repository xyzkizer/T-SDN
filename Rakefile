require 'bundler/setup'
require 'pry'
require 'racksh/irb'
require './app'

task :console do
  #binding.pry
  #racksh 
end

# Asset pipeline (Sprockets)
namespace :assets do
  task :precompile do
    Application.sprockets['application.js'].write_to('public/assets/application.js')
    Application.sprockets['application.css'].write_to('public/assets/application.css')
  end
end
